This is a Multitennat app

## Getting Started

First, install the dependencis in package.json using:

```bash
npm install
```

After installing the packages

```
Create a database called multi-tennant in postgres
```

Navigate To the project folder and create a .env file(sample is given in .env.example) and run

```
npx db-migrate up initialize
```

After migrating the tables you can run

```
npm run start
```

First create a tennant

```
POST: http://localhost:8000/api/v1/tennants

payload:{
"storeName": "RedDoko",
"fullName":"Red Doko LLC",
"email":"company@reddoko.com"
}

response:{
    "message": "Tennant created successfully"
}
```

Second insert Product by uploading a csv file providing the storeName using "form-data"

```
POST: http://localhost:8000/api/v1/products

payload:{
"csvFile":"",
"storeName":"RedDoko"
}
```

To check if the product is inserted to current tennant

```
GET: http://localhost;8000/api/v1/products/RedDoko
response:
{
"product": [
        {
            "id": 4802,
            "product_name": "MILLIE DRESS NAVY BLUE 78001-3 - S",
            "sale_price": 189,
            "compare_price": null,
            "quantity": 2,
            "product_description": "Delicate, long adjusted dress."
        },
        {
            "id": 4803,
            "product_name": "MILLIE DRESS NAVY BLUE 78001-3 - M",
            "sale_price": 189,
            "compare_price": null,
            "quantity": 2,
            "product_description": "Delicate, long adjusted dress."
        },
        ....
]
}
```

Migration Tool is in `utils/migrate-tool`
