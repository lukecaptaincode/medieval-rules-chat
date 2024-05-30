import { loadQARefineChain } from 'langchain/chains';
import { ChainValues } from '@langchain/core/utils/types';
import { OpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { PromptTemplate } from '@langchain/core/prompts';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import path from 'path';

export default class DocTalker {
    private embeddings: OpenAIEmbeddings;

    private store!: MemoryVectorStore;

    constructor(OPENAI_API_KEY?: string) {
        console.info('Initializing DocTalker');
        this.embeddings = new OpenAIEmbeddings();
        this.buildStore().then(
            (vectorStore: MemoryVectorStore) => (this.store = vectorStore)
        );
    }

    async loadPDFs(): Promise<Document[]> {
        console.info('Loading PDFS');
        const directoryLoader = new DirectoryLoader(
            path.join(__dirname, 'pdfs'),
            {
                '.pdf': (path: string) => new PDFLoader(path),
            }
        );
        const docs = await directoryLoader.load();
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splitDocs: Document[] = await textSplitter.splitDocuments(docs);
        console.info('PDFS Loaded');
        return splitDocs;
    }

    async buildStore(): Promise<MemoryVectorStore> {
        console.info('Building store');
        const docs = await this.loadPDFs();
        const store = await MemoryVectorStore.fromDocuments(
            docs,
            this.embeddings
        );
        console.info('Store built');
        return store;
    }

    async prompt(question: string): Promise<ChainValues> {
        const questionPromptTemplateString = `Context information is below.
        ---------------------
        {context}
        ---------------------
        Given the context information and no prior knowledge, answer the question: {question}`;

        const questionPrompt = new PromptTemplate({
            inputVariables: ['context', 'question'],
            template: questionPromptTemplateString,
        });

        const refinePromptTemplateString = `The original question is as follows: {question}
        We have provided an existing answer: {existing_answer}
        We have the opportunity to refine the existing answer
        (only if needed) with some more context below.
        ------------
        {context}
        ------------
        Given the new context, refine the original answer to better answer the question.
        You must provide a response, either original answer or refined answer.`;

        const refinePrompt = new PromptTemplate({
            inputVariables: ['question', 'existing_answer', 'context'],
            template: refinePromptTemplateString,
        });

        // Create the models and chain
        const model = new OpenAI({ temperature: 0 });
        const chain = loadQARefineChain(model, {
            questionPrompt,
            refinePrompt,
        });

        const relevantDocs = await this.store.similaritySearch(question);

        // Call the chain
        const res = await chain.invoke({
            input_documents: relevantDocs,
            question,
        });

        return res;
    }
}
