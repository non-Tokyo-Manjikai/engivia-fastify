import textToSpeech from '@google-cloud/text-to-speech';

const client = new textToSpeech.TextToSpeechClient({
  projectId: 'ntm-engivia',
  // 本番環境ではこのキーをどこに管理すべきか調べる必要がある
  keyFilename: 'gcs-token.json',
});

export const getTitleCallAudio = async (text: string) => {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: 'ja-JP' },
    audioConfig: { audioEncoding: 'MP3' }
  });
  if (!response.audioContent) {
    throw new Error('synthesizeSpeech error');
  }
  const base64encoded = Buffer.from(response.audioContent).toString('base64');
  console.log(`base64encoded: ${base64encoded}`);
  return base64encoded;
}

/*
const base64Sound = getTitleCallAudio('こんにちは');
console.log(base64Sound);
*/

/* response
{
  audioContent: Buffer(4512) [Uint8Array] [
    255, 243,  68, 196,   0,   0,   0,   3,  72,   0,   0,   0,
      0,  46,  14,   7, 248, 183, 137, 184, 185, 151,  51, 173,
     70, 160,  86,  60, 137, 172, 221, 251, 245,  98, 177,  88,
    241, 227, 200, 148, 232, 136,   0,  33,  11, 116,  66, 221,
    220, 224,  24, 183,  63, 255, 221, 221, 223,  64,  48,  55,
    121,  71, 127, 224, 129, 200, 144, 231, 127, 255, 255, 249,
    115, 254,  81, 217,  64, 124,  63,   4,  43,   7, 213,   7,
     59,  46,  13, 113, 230,  55,   3,  14,  46,  45,  12, 200,
    255, 243,  68, 196,
    ... 4412 more items
  ]
}
*/
