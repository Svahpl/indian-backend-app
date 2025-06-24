
import {z} from "zod";

export const ProductSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().positive("Price must be positive").min(0.01, "Price is required"),
    category: z.string().min(1, "Category is required"),
    quantity: z.coerce.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
    subcategory : z.string(),
    KeyIngredients : z.string()
});

export const UserSchema = z.object({

    FullName : z.string(),

    Password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),


    Email: z.string()
        .email(),

})

export const LoginUser = z.object({
    Email: z.string()
        .email({ message: "Invalid email format" }),

    Password: z.string()
        .min(6, { message: "password must be at least 6 characters long" })
        .max(20, { message: "password must be at least 20 characters long" }),
})

export const formSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    companyEmail: z
        .string()
        .email('Invalid email format')
        .min(1, 'Company email is required'),
    country: z.string().min(1, 'Country is required'),
    companyAddress: z.string().min(1, 'Company address is required'),
    websiteLink: z
        .string()
        .url('Invalid website URL')
        .optional()
        .or(z.literal('')), 
        code: z.string().min(1, 'Country code is required'),
        number: z
            .string()
            .min(5, 'Mobile number must be at least 5 digits') 
            .max(15, 'Mobile number too long'),
    requirements: z.string().min(1, 'Requirements are required'),
    additionalMessage: z.string().optional(),
});

export const salseSchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    companyName: z.string().min(1, 'Company name is required'),
    companyEmail: z
        .string()
        .email('Invalid email format')
        .min(1, 'Company email is required'),
    country: z.string().min(1, 'Country is required'),
    companyAddress: z.string().min(1, 'Company address is required'),
    websiteLink: z
        .string()
        .url('Invalid website URL')
        .optional()
        .or(z.literal('')),
        code: z.string().min(1, 'Country code is required'),
        number: z
            .string()
            .min(5, 'Mobile number must be at least 5 digits')
            .max(15, 'Mobile number too long'),
    SalesDetails: z.string().min(1, 'salse detail are required'),
    additionalMessage: z.string().optional()
});