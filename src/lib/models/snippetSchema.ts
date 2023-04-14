import mongoose = require('mongoose');

export interface ISnippet extends mongoose.Document {
	title: string;
	body: string;
	triggers: string[];
}

const snippetSchema = new mongoose.Schema({
	title: { type: String, require: true, unique: true }, // The title of the snippet
	body: { type: String, require: true }, // The body, or main text, of the snippet
	triggers: { type: [String], require: true } // The triggers that will activate the snippet
});

export const Snippet = mongoose.model<ISnippet>('snippets', snippetSchema);
export default Snippet;
