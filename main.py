import uuid
import boto3
from datetime import datetime
from fastapi import FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import os

app = FastAPI(title="Acortador de Enlaces AWS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://acortador-steven-web.s3-website.us-east-2.amazonaws.com"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

REGION = os.getenv("AWS_REGION", "us-east-2")
dynamodb = boto3.resource('dynamodb', region_name=REGION)
table = dynamodb.Table('Acortador_URL')

class URLRequest(BaseModel):
    original_url: HttpUrl

@app.post("/shorten")
async def create_short_url(request: URLRequest):
    short_code = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    item = {
        "short_code": short_code,
        "original_url": str(request.original_url),
        "created_at": created_at
    }
    
    try:
        table.put_item(Item=item)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error interno al conectar con la base de datos")
        
    host = os.getenv("API_HOST", "http://13.58.91.124:8000")
    
    return {
        "short_code": short_code,
        "original_url": item["original_url"],
        "short_url": f"{host}/{short_code}"
    }

@app.get("/{short_code}")
async def redirect_to_original(short_code: str):
    response = table.get_item(Key={"short_code": short_code})
    item = response.get("Item")
    
    if not item:
        raise HTTPException(status_code=404, detail="Not Found")

    return RedirectResponse(url=item["original_url"], status_code=status.HTTP_307_TEMPORARY_REDIRECT)

@app.get("/urls/{short_code}")
async def get_url_info(short_code: str):
    response = table.get_item(Key={"short_code": short_code})
    item = response.get("Item")
    
    if not item:
        raise HTTPException(status_code=404, detail="Not Found")
        
    return item