# add your save-note function here
import json
import boto3
from botocore.exceptions import ClientError

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("lotion-30147476")

def lambda_handler(event, context):
    try:
        print("Event:", event)  # Log the received event

        body = json.loads(event["body"])  # Parse the JSON data from the request body

        title = body["title"]
        id = body["id"]
        note_body = body["body"]
        when = body["when"]
        email = event["headers"]["email"]
        access_token = event["headers"]["access_token"]

        # Verify the access_token here if necessary

        response = table.put_item(
            Item={
                "email": email,
                "title": title,
                "id" :id,
                "body": note_body,
                "when": when
            }
        )

        return {
            "statusCode": 200,
            "headers": { "Content-Type": "application/json" },  # Add this line to set the Content-Type header
            "body": json.dumps({
                "success": True
            })
        }
    except ClientError as e:
        return {
            "statusCode": 500,
            "headers": { "Content-Type": "application/json" },  # Add this line to set the Content-Type header
            "body": json.dumps({
                "success": False,
                "error": str(e)
            })
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "headers": { "Content-Type": "application/json" },  # Add this line to set the Content-Type header
            "body": json.dumps({
                "success": False,
                "error": str(e)
            })
        }
