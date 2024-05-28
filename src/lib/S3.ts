import AWS from "aws-sdk"

export async function uploadtoS3(file: File){
    try {
        AWS.config.update({
            accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
        })
        const s3 = new AWS.S3({
            params: {
                bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME
            },
            region: "eu-central-1"
        })

        const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ','-')

        const params = {
            Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
            Key: file_key,
            Body: file
        }
        const upload = s3.putObject(params).on('httpUploadProgress',evt=> {
            console.log('Uploading to s3',parseInt(((evt.loaded*100)/evt.total).toString())) + '%'
        }).promise()

        await upload.then((data) => {
            console.log("Successfully uploaded", file_key)
        })

        return Promise.resolve({
            file_key,
            file_name : file.name
        })

    } catch (error) {
        
    }
}

export function getS3Url(file_key: string){
    const url = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.eu-central-1.amazonaws.com/${file_key}`
    return url
}