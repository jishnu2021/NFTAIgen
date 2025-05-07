from flask import Flask, request, jsonify, Response
import requests
from flask_cors import CORS
import json
import base64
import io
import openai
from dotenv import load_dotenv
import os
# Load .env file
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


app = Flask(__name__)
CORS(app)

@app.route('/generate-image', methods=['POST'])
def generate_image():
    data = request.get_json()
    prompt = data.get('prompt')

    try:
        response = openai.Image.create(
            prompt=prompt,
            n=1,
            size="512x512"
        )
        image_url = response.data[0].url
        return jsonify({"image_url": image_url})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/proxy-image", methods=["POST"])
def proxy_image():
    try:
        data = request.json
        if not data or 'image_url' not in data:
            return jsonify({"error": "No image URL provided"}), 400
            
        image_url = data['image_url']
        
        print(f"Attempting to proxy image from: {image_url}")
        
        # Add custom headers to bypass some restrictions
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
        
        # Make the request to get the image
        response = requests.get(image_url, headers=headers, stream=True, timeout=10)
        
        if response.status_code != 200:
            return jsonify({"error": f"Failed to fetch image: {response.status_code}"}), 500
        
        # Get the content type from the response headers
        content_type = response.headers.get('Content-Type', 'image/png')
        
        # Get the binary data
        image_data = response.content
        
        # Return the response as Flask Response object
        from flask import Response
        return Response(
            image_data,
            status=200,
            mimetype=content_type
        )
        
    except requests.exceptions.Timeout:
        print("Request timed out when fetching the image")
        return jsonify({"error": "Request timed out when fetching the image"}), 504
    except requests.exceptions.RequestException as e:
        print(f"Request exception in proxy_image: {str(e)}")
        return jsonify({"error": f"Request error: {str(e)}"}), 500
    except Exception as e:
        print(f"Error in proxy_image: {str(e)}")
        return jsonify({"error": str(e)}), 500

# New server-to-server proxy method for direct IPFS upload
@app.route("/server-proxy-upload", methods=["POST"])
def server_proxy_upload():
    try:
        data = request.json
        if not data or 'image_url' not in data or 'pinata_jwt' not in data:
            return jsonify({"success": False, "error": "Missing required parameters"}), 400
            
        image_url = data['image_url']
        pinata_jwt = data['pinata_jwt']
        prompt = data.get('prompt', 'AI Generated Artwork')
        
        print(f"Attempting server-side upload of image from: {image_url}")
        
        # Step 1: Get the image
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
            
            response = requests.get(image_url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                return jsonify({
                    "success": False, 
                    "error": f"Failed to fetch image: {response.status_code}"
                }), 500
                
            image_data = response.content
        except Exception as e:
            print(f"Error fetching image: {str(e)}")
            return jsonify({"success": False, "error": f"Error fetching image: {str(e)}"}), 500
        
        # Step 2: Upload image to Pinata
        try:
            # Create multipart form data
            files = {
                'file': ('artwork.png', image_data, 'image/png')
            }
            
            pinata_headers = {
                'Authorization': f'Bearer {pinata_jwt}'
            }
            
            image_upload_response = requests.post(
                "https://api.pinata.cloud/pinning/pinFileToIPFS",
                files=files,
                headers=pinata_headers
            )
            
            if image_upload_response.status_code != 200:
                print(f"Pinata image upload failed: {image_upload_response.text}")
                return jsonify({
                    "success": False, 
                    "error": f"Pinata image upload failed: {image_upload_response.status_code}"
                }), 500
                
            image_upload_data = image_upload_response.json()
            image_cid = image_upload_data["IpfsHash"]
            
        except Exception as e:
            print(f"Error uploading image to Pinata: {str(e)}")
            return jsonify({
                "success": False, 
                "error": f"Error uploading to Pinata: {str(e)}"
            }), 500
        
        # Step 3: Create and upload metadata
        try:
            # Create metadata JSON
            metadata_json = {
                "name": f"AI Generated Artwork: {prompt[:30]}...",
                "description": prompt,
                "image": f"ipfs://{image_cid}",
                "attributes": [
                    {
                        "trait_type": "Generator",
                        "value": "AI Art Generator"
                    },
                    {
                        "trait_type": "Creation Date",
                        "value": f"{__import__('datetime').datetime.now().isoformat()}"
                    }
                ]
            }
            
            # Upload metadata to Pinata
            metadata_upload_response = requests.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                json=metadata_json,
                headers=pinata_headers
            )
            
            if metadata_upload_response.status_code != 200:
                print(f"Pinata metadata upload failed: {metadata_upload_response.text}")
                return jsonify({
                    "success": False, 
                    "error": f"Pinata metadata upload failed: {metadata_upload_response.status_code}"
                }), 500
                
            metadata_upload_data = metadata_upload_response.json()
            metadata_cid = metadata_upload_data["IpfsHash"]
            token_uri = f"ipfs://{metadata_cid}"
            
            # Return success with CIDs
            return jsonify({
                "success": True,
                "imageCID": image_cid,
                "metadataCID": metadata_cid,
                "tokenURI": token_uri
            })
            
        except Exception as e:
            print(f"Error creating/uploading metadata: {str(e)}")
            return jsonify({
                "success": False, 
                "error": f"Error with metadata: {str(e)}"
            }), 500
            
    except Exception as e:
        print(f"Error in server_proxy_upload: {str(e)}")
        return jsonify({
            "success": False, 
            "error": f"Server proxy error: {str(e)}"
        }), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)