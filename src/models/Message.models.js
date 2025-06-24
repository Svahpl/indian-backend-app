import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    companyName: {
        type: String,
        required: true,
    },
    companyEmail: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    companyAddress: {
        type: String,
        required: true,
    },
    websiteLink: {
        type: String,
        trim: true,
        default: '',
    },
    code: {
        type: String,
        required: true,
    },
    number: {
        type: String,
        required: true,
    },
    requirements: {
        type: String,
        required: true,
    },
    additionalMessage: {
        type: String,
        default: '',
    }
}, {
    timestamps: true
});

export default mongoose.model('FormSubmission', formSchema);
