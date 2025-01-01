import pymysql
import requests
import json
from datetime import datetime

# Database connection function
def connect_to_db():
    return pymysql.connect(
        host='svc-3482219c-a389-4079-b18b-d50662524e8a-shared-dml.aws-virginia-6.svc.singlestore.com',
        user='büşra-98bba',
        password='FR0fUrrcVqMSrOhJxU2pr74cbeiYLFry',
        database='db_bra_e0d85',
        port=3333,
        autocommit=True,
        ssl={
            "ca": r"C:\\Users\\pc\\Desktop\\otoanaliz\\singlestore_bundle.pem"
        }
    )

# Function to create the table if it does not exist
def create_table_if_not_exists(table_name):
    connection = connect_to_db()
    try:
        with connection.cursor() as cursor:
            create_table_sql = f"""
            CREATE TABLE IF NOT EXISTS {table_name} (
                id INT PRIMARY KEY,
                make VARCHAR(255),
                model VARCHAR(255),
                year INT,
                cylinders INT,
                engine_displacement FLOAT,
                drive VARCHAR(255),
                fuel_type VARCHAR(255),
                fuel_cost INT,
                fuel_type1 VARCHAR(255),
                transmission VARCHAR(255),
                vehicle_size_class VARCHAR(255),
                you_save_spend INT,
                annual_petroleum_consumption FLOAT,
                fetch_date TIMESTAMP
            );
            """
            cursor.execute(create_table_sql)
            print(f"{table_name} table created or already exists.")
    except Exception as e:
        print(f"Error creating table: {e}")
    finally:
        connection.close()

# Function to fetch JSON data from the API
def fetch_data_from_url():
    url = "https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/all-vehicles-model/exports/json?lang=en&timezone=Europe%2FMinsk"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Hata ayıklama için veriyi yazdırın
        print("Fetched data:", data)

        return data
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error: {http_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"Request error: {req_err}")
    except ValueError as json_err:
        print(f"JSON decode error: {json_err}")
    return None


# Function to save or update data in the database
def save_data_to_db(data, table_name):
    if isinstance(data, dict) and "results" in data:
        car_models = data["results"]
    elif isinstance(data, list):
        car_models = data  # JSON doğrudan listeyse
    else:
        print("Unexpected JSON format.")
        return
    
    connection = connect_to_db()
    try:
        with connection.cursor() as cursor:
            fetch_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            count = 0

            for item in car_models:
                # Kayıtları almak ve gerekli alanları seçmek
                id = item.get('id')
                make = item.get('make')
                model = item.get('model')
                year = item.get('year')
                cylinders = item.get('cylinders')
                engine_displacement = item.get('displ')
                drive = item.get('drive')
                fuel_type = item.get('fueltype')
                fuel_cost = item.get('fuelcost08')
                fuel_type1 = item.get('fueltype1')
                transmission = item.get('trany')
                vehicle_size_class = item.get('vclass')
                you_save_spend = item.get('yousavespend')
                annual_petroleum_consumption = item.get('barrels08')

                # SQL sorgusu ve kayıt
                check_sql = f"SELECT COUNT(*) FROM {table_name} WHERE id = %s"
                cursor.execute(check_sql, (id,))
                exists = cursor.fetchone()[0] > 0

                if not exists:
                    sql = f"""
                        INSERT INTO {table_name}
                        (id, make, model, year, cylinders, engine_displacement, drive, fuel_type, fuel_cost,
                         fuel_type1, transmission, vehicle_size_class, you_save_spend, annual_petroleum_consumption, fetch_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(sql, (id, make, model, year, cylinders, engine_displacement, drive, fuel_type,
                                         fuel_cost, fuel_type1, transmission, vehicle_size_class, you_save_spend,
                                         annual_petroleum_consumption, fetch_date))
                else:
                    update_sql = f"""
                        UPDATE {table_name}
                        SET make = %s, model = %s, year = %s, cylinders = %s, engine_displacement = %s, drive = %s,
                            fuel_type = %s, fuel_cost = %s, fuel_type1 = %s, transmission = %s,
                            vehicle_size_class = %s, you_save_spend = %s, annual_petroleum_consumption = %s, fetch_date = %s
                        WHERE id = %s
                    """
                    cursor.execute(update_sql, (make, model, year, cylinders, engine_displacement, drive, fuel_type,
                                                fuel_cost, fuel_type1, transmission, vehicle_size_class, you_save_spend,
                                                annual_petroleum_consumption, fetch_date, id))

                # İşlem sayısını takip et ve her 1000 kayıttan sonra çıktı ver
                count += 1
                if count % 1000 == 0:
                    print(f"{count} kayıt işlendi...")

            print("Tüm veriler başarıyla kaydedildi.")
    except Exception as e:
        print(f"Veritabanına veri kaydedilirken hata oluştu: {e}")
    finally:
        connection.close()


# Main program
def main():
    table_name = 'arabalar'  # Set your table name here
    create_table_if_not_exists(table_name)

    data = fetch_data_from_url()
    
    if data:
        save_data_to_db(data, table_name)
        print("Data saved successfully.")
    else:
        print("Data could not be fetched.")

if __name__ == "__main__":
    main()
