import pdfParse from "pdf-parse";

export type PdfParseResult = {
    text: string;
};

export const extractTextFromPdf = async (file: any): Promise<PdfParseResult> => {
    console.log(file)
    if(file.size > 1048576) throw new Error('File size should less than 1MB')
    try {
        const data: PdfParseResult = await pdfParse(file.data);
        return data
    } catch (err) {
        throw new Error("Failed to extract text from PDF.");
    }
}