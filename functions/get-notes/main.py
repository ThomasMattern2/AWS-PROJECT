# add your get-notes function here
import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
table_name = "lotion-30147476"


def get_notes(email):
    try:
        response = dynamodb.Table(table_name).query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
        )
        return response['Items']
    except ClientError as e:
        print(e.response['Error']['Message'])
        return None


def lambda_handler(event, context):
    email = event['headers']['email']
    access_token = event['headers']['access_token']


    notes = get_notes(email)

    if notes is not None:
        return {
            'statusCode': 200,
            'body': json.dumps({'notes': notes}),
            'headers': {
                'Content-Type': 'application/json'
            },
        }
    else:
        return {
            'statusCode': 500,
            'body': 'Error fetching notes',
        }
