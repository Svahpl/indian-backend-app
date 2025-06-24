import { formSchema } from "../utils/auth.validation.js";
import { salseSchema } from "../utils/auth.validation.js";
import  FormSubmission  from "../models/Message.models.js"
import salseSubmission from "../models/Salse.models.js"


export const MessegeSubmit  = async (req,res) => {
    try {
            const parsed = formSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: parsed.error.errors[0].message,
      });
    }

        const {
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            requirements,
            code,
            number,
            additionalMessage
        } = parsed.data;

        const formdata = await  FormSubmission.create({
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            requirements,
            code,
            number,
            additionalMessage
        })

        res.status(200).json({ msg : "form submitted" , formdata})

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg : "somthing went wrong " , error})
    }
}

export const SalseMessegeSubmit = async (req, res) => {
    try {
        const { data, error } = salseSchema.safeParse(req.body);
        if (error) {
            return res.json({
                message: error.errors[0].message,
            });
        }
        const {
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            SalesDetails,
            code,
            number,
            additionalMessage
        } = data;

        const formdata = await salseSubmission.create({
            fullName,
            companyName,
            companyEmail,
            country,
            companyAddress,
            websiteLink,
            SalesDetails,
            code,
            number,
            additionalMessage
        })

        res.status(200).json({ msg: "form submitted", formdata })

    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: "somthing went wrong ", error })
    }
}

export const getrequirement = async(req,res) => {
    try {
        const requirements = await FormSubmission.find();
        res.status(200).json({ msg: "form data fetched", requirements })
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg : "somthing went wrong to fetch data of form" , error})
    }

}

export const getsalse = async (req, res) => {
    try {
        const salse = await salseSubmission.find();
        res.status(200).json({ msg: "form data fetched",salse})
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: "somthing went wrong to fetch data of form", error })
    }

}
