import DocTalker from '@medieval-rules-chat/doc-talker';
const docTalker: DocTalker = new DocTalker();
export async function POST(request: Request): Promise<Response> {
    const result = await docTalker.prompt('Rules for longsword');
    console.info(result);
    return new Response('Hello, from API!!!');
}
