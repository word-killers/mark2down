from urllib import urlencode
from requests import post

auth_url = 'https://github.com/login/oauth/authorize'
access_token_url = 'https://github.com/login/oauth/access_token'


def generate_auth_link(client_id, scopes):

    # append the client_id and scopes list to the url query string
    return auth_url + '?' + urlencode({
        'client_id': client_id,
        'scope': ','.join(scopes)
    })


def get_auth_token(client_id, client_secret, code):

    # request a token
    response = post(
        access_token_url,
        data={
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code
        },
        headers={
            'Accept': 'application/json'
        }
    )

    # decode the response
    json = response.json()

    # check if response contains the token
    if 'access_token' in json:
        return json['access_token']
    else:
        return None  # token request failed
