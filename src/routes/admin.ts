import { Router } from "express";
import {
    login,
    //  getAdminInfo, editAdminInfo, 
    // verifySession,
    //  passwordReset, forgotPassword, newPassswordAfterEmailSent, 
    getDashboardStats,
    getClients,
    getTherapists,
    deleteClient,
    deleteTherapist,
    updateClientStatus,
    updateTherapist,
    //  updateDashboardStats
} from "../controllers/admin/admin";
// import { checkAdminAuth } from "../middleware/check-auth";
import { upload } from "../configF/multer";
import { checkMulter } from "../lib/errors/error-response-handler"
import { addWellness, deleteWellness, getWellness } from "../controllers/admin/wellness"
import { addUser, deleteUser, getUsers } from "../controllers/admin/user"
import { getAppointments, updateAppointmentStatus } from "../controllers/appointments/appointments";
import { getAllPaymentRequests } from "../controllers/payment-request/payment-request";

const router = Router();

router.post("/login", login)
router.get("/dashboard", getDashboardStats)
router.get("/appointments", getAppointments)
router.patch("/appointments/:id", updateAppointmentStatus)

router.get("/clients", getClients)
router.route("/clients/:id").delete(deleteClient).patch(updateClientStatus)

router.get("/therapists", getTherapists)
router.route("/therapists/:id").delete(deleteTherapist).put(updateTherapist)

router.route("/wellness").get(getWellness).post(addWellness)
router.delete("/delete-wellness/:id", deleteWellness)

router.route("/users").get(getUsers).post(addUser)
router.delete("/users/:id", deleteUser)

router.get("/payment-requests", getAllPaymentRequests)

// router.get("/verify-session", verifySession);
// router.patch("/update-password", passwordReset)
// router.patch("/forgot-password", forgotPassword)
// router.patch("/new-password-email-sent", newPassswordAfterEmailSent)
// router.put("/edit-info", upload.single("profilePic"), checkMulter, editAdminInfo)
// router.get("/info", getAdminInfo)

// Protected routes
// router.route("/dashboard").get(getDashboardStats).put(updateDashboardStats);
// router.route("/card").post(upload.single("image"), checkMulter, createCard).get(getCards)
// router.route("/card/:id").delete(deleteACard).patch(changeCardStatus)
// router.route("/cards-per-spinner").get(getCardsPerSpinner).patch(updateCardsPerSpinner)


export { router }