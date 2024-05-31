import DocTalker from '@medieval-rules-chat/doc-talker';
const docTalker: DocTalker = new DocTalker();

export const loadTalker = async (): Promise<undefined> => {
    await docTalker.initStore();
};

export const getDocTalker = () => docTalker;
