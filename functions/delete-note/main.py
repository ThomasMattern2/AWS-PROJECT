import boto3
import json

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('lotion-30147476')

def email_exists(email, access_token):
    response = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
    )
    return len(response['Items']) > 0

def lambda_handler(event, context):
    body = json.loads(event["body"])  
    id = body["id"]
    email = event["headers"]["email"]
    access_token = event["headers"]["access_token"]

    if not email_exists(email, access_token):
        return {
            'statusCode': 401,
            'body': json.dumps({'error': 'Unauthorized'})
        }

    try:    
        response = table.delete_item(
            Key={
                'email': email,
                'id': id
            }
        )

        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Note deleted successfully'})
        }
    except Exception as e:
        print(e)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to delete note'})
        }
