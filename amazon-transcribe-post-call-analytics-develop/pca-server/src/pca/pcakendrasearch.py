"""
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
"""
import json
import boto3
import textwrap
import urllib
import dateutil.parser

KENDRA = boto3.client('kendra')
S3 = boto3.client('s3')


def prepare_transcript(results):
    """
    Parses the output from the Transcribe job, inserting time markers at the start of each sentence.
    The time markers enable Kendra search results to link to the relevant time marker in the
    corresponding audio recording.
    """

    print(f"prepare_transcript() for {results.get_conv_analytics().get_transcribe_job().transcribe_job_name}")
    txt = ""
    for segment in results.speech_segments:
        # If we have word-level timestamps then split this into sentences,
        # otherwise a returned Kendra fragment might not contain a timestamp
        if segment.segmentConfidence[0]["EndTime"] > 0:
            new_sentence = True
            for word in segment.segmentConfidence:
                # First word in a sentence needs the start time
                if new_sentence:
                    if txt != "":
                        txt = txt + "  "
                    txt = txt + f"[{word['StartTime']}] "
                    new_sentence = False

                txt = txt + f"{word['Text']}"
                if str(word["Text"]).endswith(".") or str(word["Text"]).endswith("?"):
                    new_sentence = True
        else:
            # Unfortunately not, so need to create a single entry in Kendra (which could be large)
            if txt != "":
                txt = txt + "  "
            txt = txt + f"[{segment.segmentStartTime}] {segment.segmentText}"

    out = textwrap.fill(txt, width=70)
    return out


def parse_s3uri(s3ur1):
    """
    Parses bucket, key, and filename from an S3 uri, eg s3://bucket/prefix/filename 
    """
    r = urllib.parse.urlparse(s3ur1, allow_fragments=False)
    bucket = r.netloc
    key = r.path.lstrip("/")
    file_name = key.split("/")[-1]
    return [bucket, key, file_name]

def get_bucket_region(bucket):
    """
    get bucket location.. buckets in us-east-1 return None, otherwise region is identified in LocationConstraint
    """
    try:
        region = S3.get_bucket_location(Bucket=bucket)["LocationConstraint"] or 'us-east-1' 
    except Exception as e:
        print(f"Unable to retrieve bucket region (bucket owned by another account?).. defaulting to us-east-1. Bucket: {bucket} - Message: " + str(e))
        region = 'us-east-1'
    return region


def get_http_from_s3_uri(s3uri):
    """
    Convert URI from s3:// to https://
    """
    bucket, key, file_name = parse_s3uri(s3uri)
    region = get_bucket_region(bucket)
    http_uri = f"https://s3.{region}.amazonaws.com/{bucket}/{key}"
    return http_uri


def iso8601_datetime(value):
    """
    Convert string to datetime
    """
    try:
        dt = dateutil.parser.isoparse(value)
    except Exception as e:
        return False
    return dt


def get_entity_values(entityType, dicts, maxLength=10):
    """
    Return string array of entity values for specified type, from the inpout array of entityType dicts
    """
    entityList=["None"]
    entityDict = next((item for item in dicts if item["Name"] == entityType), None)
    if entityDict:
        entityList = entityDict["Values"]
    return entityList[:maxLength]


def durationBucket(durationStr):
    """
    Return string category label for call duration
    """
    duration = int(float(durationStr))
    if duration < 60:
        return "0 to 1 min"
    elif duration < 120:
        return "1 min to 2 min"
    elif duration < 180:
        return "2 min to 3 min"
    elif duration < 300:
        return "3 min to 5 min"
    elif duration < 600:
        return "5 min to 10 min"
    else:
        return "over 10 min"


def put_kendra_document(indexId, analysisUri, conversationAnalytics, text):
    """
    index the prepared transcript in Kendra, setting all the document index attributes to support 
    filtering, faceting, and search.
    """
    print(f"put_document(indexId={indexId}, analysisUri={analysisUri}, conversationAnalytics={conversationAnalytics}, text='{text[0:100]}...')")
    document = {
        "Id": conversationAnalytics["SourceInformation"][0]["TranscribeJobInfo"]["MediaOriginalUri"],
        "Title": conversationAnalytics["SourceInformation"][0]["TranscribeJobInfo"]["TranscriptionJobName"],
        "Attributes": [
            {
                "Key": "_source_uri",
                "Value": {
                    "StringValue": get_http_from_s3_uri(conversationAnalytics["SourceInformation"][0]["TranscribeJobInfo"]["MediaFileUri"])
                }
            },
            {
                "Key": "ANALYSIS_URI",
                "Value": {
                    "StringValue": analysisUri
                }
            },
            {
                "Key": "DATETIME",
                "Value": {
                    "DateValue": iso8601_datetime(conversationAnalytics["ConversationTime"])
                }
            },
            {
                "Key": "GUID",
                "Value": {
                    "StringValue": conversationAnalytics["GUID"]
                }
            },
            {
                "Key": "AGENT",
                "Value": {
                    "StringValue": conversationAnalytics["Agent"]
                }
            },
            {
                "Key": "DURATION",
                "Value": {
                    "StringValue": durationBucket(conversationAnalytics["Duration"])
                }
            },
            {
                "Key": "ENTITY_PERSON",
                "Value": {
                    "StringListValue": get_entity_values("PERSON", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_LOCATION",
                "Value": {
                    "StringListValue": get_entity_values("LOCATION", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_ORGANIZATION",
                "Value": {
                    "StringListValue": get_entity_values("ORGANIZATION", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_COMMERCIAL_ITEM",
                "Value": {
                    "StringListValue": get_entity_values("COMMERCIAL_ITEM", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_EVENT",
                "Value": {
                    "StringListValue": get_entity_values("EVENT", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_DATE",
                "Value": {
                    "StringListValue": get_entity_values("DATE", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_QUANTITY",
                "Value": {
                    "StringListValue": get_entity_values("QUANTITY", conversationAnalytics["CustomEntities"])
                }
            },
            {
                "Key": "ENTITY_TITLE",
                "Value": {
                    "StringListValue": get_entity_values("TITLE", conversationAnalytics["CustomEntities"])
                }
            }
        ],
        "Blob": text
    }
    documents = [document]
    print("KENDRA.batch_put_document: " + json.dumps(documents, default=str)[0:1000] + "...")
    result = KENDRA.batch_put_document(
        IndexId = indexId,
        Documents = documents
    )
    if 'FailedDocuments' in result and len(result['FailedDocuments']) > 0:
        print("ERROR: Failed to index document: " + result['FailedDocuments'][0]['ErrorMessage'])
    print("result: " + json.dumps(result))
    return True