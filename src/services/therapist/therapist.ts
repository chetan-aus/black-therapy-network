import { Response } from "express";
import { therapistModel } from "../../models/therapist/therapist-schema";
import bcrypt from "bcryptjs";
import { errorResponseHandler } from "../../lib/errors/error-response-handler";
import { httpStatusCode } from "../../lib/constant";
import { onboardingApplicationModel } from "../../models/therapist/onboarding-application-schema";
import { generatePasswordResetToken, getPasswordResetTokenByToken } from "../../utils/mails/token";
import { sendPasswordResetEmail } from "../../utils/mails/mail";
import { passwordResetTokenModel } from "../../models/password-token-schema";
import mongoose from "mongoose";
import { wellnessModel } from "../../models/admin/wellness-schema";

export const signupService = async (payload: any, res: Response) => {
    const { email } = payload
    const user = await therapistModel.findOne({ email })
    if (user) return errorResponseHandler('User already exists', httpStatusCode.FORBIDDEN, res)
    const newPassword = bcrypt.hashSync(payload.password, 10)
    payload.password = newPassword
    const newUser = new therapistModel({ ...payload, email: email.toLowerCase().trim() })
    await newUser.save()
    return { success: true, message: "User created successfully" }  
}

export const loginService = async (payload: any, res: Response) => {
    const { email, password } = payload;
    const user = await therapistModel.findOne({ email }).select('+password')
    if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res);

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return errorResponseHandler('Invalid password', httpStatusCode.UNAUTHORIZED, res);
    const userObject: any = user.toObject()
    delete userObject.password;
    return {
        success: true,
        message: "Login successful",
        data: userObject
    }
};

export const onBoardingService = async (payload: any, res: Response) => {
    const { email } = payload
    const user = await therapistModel.findOne({ email })
    if (!user) return errorResponseHandler('User not found', httpStatusCode.NOT_FOUND, res)
    if (user.onboardingCompleted) return errorResponseHandler('User already onboarded', httpStatusCode.BAD_REQUEST, res)
    const onboardingApplication = new onboardingApplicationModel({ therapistId: user._id, ...payload })
    await onboardingApplication.save()
    await therapistModel.findOneAndUpdate({ email }, { onboardingCompleted: true })
    return { success: true, message: "Onboarding completed successfully" }
}

export const forgotPasswordService = async (email: string, res: Response) => {
    const client = await therapistModel.findOne({ email })
    if (!client) return errorResponseHandler("Email not found", httpStatusCode.NOT_FOUND, res)
    const passwordResetToken = await generatePasswordResetToken(email)
    if (passwordResetToken !== null) {
        await sendPasswordResetEmail(email, passwordResetToken.token)
        return { success: true, message: "Password reset email sent" }
    }
}

export const newPassswordAfterEmailSentService = async (payload: { password: string, token: string }, res: Response, session: mongoose.mongo.ClientSession) => {
    const { password, token } = payload
    const existingToken = await getPasswordResetTokenByToken(token)
    if (!existingToken) return errorResponseHandler("Invalid token", httpStatusCode.BAD_REQUEST, res)

    const hasExpired = new Date(existingToken.expires) < new Date()
    if (hasExpired) return errorResponseHandler("Token expired", httpStatusCode.BAD_REQUEST, res)

    const existingClient = await therapistModel.findOne({ email: existingToken.email }).session(session)
    if (!existingClient) return errorResponseHandler("Therapist email not found", httpStatusCode.NOT_FOUND, res)

    const hashedPassword = await bcrypt.hash(password, 10)
    const response = await therapistModel.findByIdAndUpdate(existingClient._id, { password: hashedPassword }, { session, new: true })
    await passwordResetTokenModel.findByIdAndDelete(existingToken._id).session(session)
    await session.commitTransaction()
    session.endSession()

    return  {
        success: true,
        message: "Password updated successfully",
        data: response
    }
}

export const getTherapistVideosService = async () => {
    const therapistWellnessVideos = await wellnessModel.find({ assignTo: 'therapist' })
    return {
        success: true,
        message: "Therapist videos fetched successfully",
        data: therapistWellnessVideos
    }
}