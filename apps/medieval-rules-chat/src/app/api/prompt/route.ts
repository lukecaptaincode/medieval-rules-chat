import DocTalker from '@medieval-rules-chat/doc-talker';
import { getDocTalker } from './DocTalker';

export async function POST(request: Request): Promise<Response> {
    const docTalker: DocTalker = getDocTalker();
    const prompText = JSON.stringify(await request.json());
    const result = await docTalker.prompt(prompText, docTalker.store);
    return new Response(result['output_text'].toString());
}
