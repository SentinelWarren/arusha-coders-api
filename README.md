# arusha-coders-api

API to accompany the ['Securing your (RESTful) API'](https://speakerdeck.com/reubano/securing-your-restful-api) presentation

## Intro

This is a simple API that lets you create a user account and test view user info using basic or JSON Web Token (JWT) authentication.

## Usage

### Demo Server

#### cURL

create a user

```bash
# request
curl -d "name='First Last'" \
     -d "email=user@email.com" \
     -d "password=password" \
     -d "confirmPassword=password" \
     http://arusha-coders-api.herokuapp.com/user

# response
{
    "source": "signup",
    "objects": {
        "email": "user@email.com",
        "jwt": "eyJ0eXAi...",
        "exp": "DD/MM/YYYY"
    }
}
```

get user info via Basic Authentication

```bash
# request
curl -H 'Content-Type: application/json' \
    -u 'user@email.com:password' \
    http://arusha-coders-api.herokuapp.com/user

# response
{
    "objects": {
        "user": {
            "_id": "554d...",
            "password": "$2$10$...",
            "lastName": "Last",
            "firstName": "First",
            "email": "user@email.com",
            "__v": 0,
            "isVerified": false
        }
    }
}
```

get user info via JWT Bearer Token Authentication

```bash
# request
curl -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer replace_with_your_jwt' \
    http://arusha-coders-api.herokuapp.com/user

# response
{
    "objects": {
        "user": {
            "_id": "554d...",
            "password": "$2$10$...",
            "lastName": "Last",
            "firstName": "First",
            "email": "user@email.com",
            "__v": 0,
            "isVerified": false
        }
    }
}
```

create another JWT

```bash
# request
curl -X POST \
    -H 'Content-Type: application/json' \
    -u 'user@email.com:password' \
    http://arusha-coders-api.herokuapp.com/token

# response
{"objects": {"result": {"jwt": "eyJ0e...", "exp": "DD/MM/YYYY"}}}
```

#### Python

initialize

```python
# init requirements
import requests

# set api endpoint
base = 'http://arusha-coders-api.herokuapp.com'
```

create a user

```python
# request
name, username, password = 'First Last', 'user@email.com', 'password'
data = {'name': name, 'email': username, 'password': password, 'confirmPassword': password}
r = requests.post(base + '/user', data=data)

# response
r.json()
# same as cURL above
```

get user info via Basic Authentication

```python
# extract JWT
jwt = r.json()['objects']['jwt']

# request
auth = (username, password)
r = requests.get(base + '/user', auth=auth)

# response
r.json()
# same as cURL above
```

get user info via JWT Bearer Token Authentication

```python
# request
headers = {'Authorization': 'Bearer %s' % jwt}
r = requests.get(base + '/user', headers=headers)

# response
r.json()
# same as cURL above
```

create another JWT

```python
# request
r = requests.post(base + '/token', auth=auth)

# response
r.json()
# same as cURL above
```

### Local Server

    git clone https://github.com/reubano/arusha-coders-api.git
    npm install
    npm start

#### cURL

create a user

```bash
# request
curl -d "name='First Last'" \
     -d "email=user@email.com" \
     -d "password=password" \
     -d "confirmPassword=password" \
     http://127.0.0.1:3333/user
```

get user info via Basic Authentication

```bash
# request
curl -H 'Content-Type: application/json' \
    -u 'user@email.com:password' \
    http://127.0.0.1:3333/user
```

get user info via JWT Bearer Token Authentication

```bash
# request
curl -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer replace_with_your_jwt' \
    http://127.0.0.1:3333/user
```

create another JWT

```bash
# request
curl -X POST \
    -H 'Content-Type: application/json' \
    -u 'user@email.com:password' \
    http://127.0.0.1:3333/token
```

#### Python

```python
# init requirements
import requests

# set api endpoint
base = 'http://localhost:3333'

# continue directions from above
```

## License

This code is free to use and distribute, under the [MIT license](https://raw.github.com/reubano/arusha-coders-api/master/LICENSE).
