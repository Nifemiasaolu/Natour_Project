const Review = require("../models/reviewModel");
// const AppError = require("../utils/appError");
// const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.setUserTourIds = (req, res, next) => {
  // Nested Routes
  // This gets the body and tour automatically, if the user doesn't input them as part of the review.
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

//////////////////////////////////////////////////////////////////
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};
//   // GET Nested routes
//   // This gets the tour automatically, if the user doesn't input it as part of the review.
//   if (req.params.tourId) filter = { tour: req.params.tourId };
//
//   const reviews = await Review.find(filter);
//
//   if (!reviews) {
//     return next(new AppError("No review found", 404));
//   }
//
//   res.status(200).json({
//     status: "Success",
//     result: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });

// exports.createReview = catchAsync(async (req, res, next) => {
//   // Nested Routes
//   // This gets the body and tour automatically, if the user doesn't input them as part of the review.
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;
//
//   const newReview = await Review.create(req.body);
//
//   if (!newReview) {
//     return next(new AppError("No review created"), 400);
//   }
//
//   res.status(201).json({
//     status: "Success",
//     data: {
//       review: newReview,
//     },
//   });
// });

//////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// let params;
// let userId;
// let option;
// let userWalletId;
// let terminalId;
// let serialNumber;
// let ipUserInfo;
// let findOneUser;
// let findOneCustomer;
// let findOneTerminal;
// let findOneAggregator;

// beforeEach(() => {
//   params = {
//     type: TransactionType.AIRTIME,
//     amount: 1000,
//     product: "MTN",
//     uniqueIdentifier: "sample-identifier",
//     customerBillerId: "2385746",
//   };
//   userId = "userId";
//   option = {};
//   userWalletId = "userwalletId";
//   terminalId = "terminalId";
//   serialNumber = "serialNumber";
//   ipUserInfo = {
//     address: "San Fransisco",
//     country: "United States",
//     state: "California",
//     zipcode: "94043-1351",
//     location: { latitude: "37.42240", longitude: "-122.08421" },
//   };
//
//   findOneUser = sinon.stub(User, "findOne");
//   findOneUser.resolves({
//     userId: "sample-user-id",
//     disbursementWalletId: "sample-disbursement-wallet-id",
//     commissionWalletId: "sample-commission-wallet-id",
//     commercialBankMerchantEnabled: false,
//     ptspCommercialBankMerchantEnabled: false,
//     category: CategoryType.NON_MFB,
//     stampDutyCharge: {
//       enabled: true,
//       supportedTransactionType: [
//         {
//           transactionType: TransactionType.AIRTIME,
//           fee: 50,
//           minimumAmount: 1_000,
//           maximumAmount: 2_000,
//         },
//       ],
//     },
//   });
//
//   findOneCustomer = sinon.stub(Customer, "findOne");
//   findOneCustomer.resolves({
//     customerId: "sample-customer-id",
//     referralId: "sample-referral-id",
//     walletId: "sample-customer-wallet-id",
//     salesAggregatorReferralId: "sample-sales-aggregator-id",
//   });
//
//   findOneTerminal = sinon.stub(Terminal, "findOne");
//   findOneTerminal.resolves({
//     terminalId: "terminalId",
//     customer: {
//       userId: "sample-customer-id",
//       walletId: "sample-customer-wallet-id",
//     },
//   });
//
//   findOneAggregator = sinon.stub(Aggregator, "findOne");
//   findOneAggregator.resolves({
//     userId: "sample-usersId",
//     aggregatorId: "aggregatorID",
//     referralId: "sample-referralID",
//     commissionWalletId: "sample-commissionID",
//     identifier: "sampleID@gmail.com",
//   });
// });
//
// afterEach(() => {
//   findOneUser.restore();
//   findOneCustomer.restore();
//   findOneTerminal.restore();
//   findOneAggregator.restore();
// });

// it("should include ipUserInfo in the modifiedParams of create function", async () => {
//   const result = await create({
//     params,
//     userId,
//     option,
//     userWalletId,
//     terminalId,
//     serialNumber,
//     ipUserInfo,
//   });
//
//   console.log(` ======= Result: ${JSON.stringify(result)} =======`);
// });

// 617006d9beb2c32940819bb7

// 618d40c136a02100032df6df

// 6265395802cf900003118f74

/////////////////////////////////////////////
// import mongoose from "mongoose";
// import CustomerPayout from "./payout.customer";
// import logger from "../../../logger";
// import { dateInstanceByTimeZone, formatDateByFormat } from "../../modules/util";
// import { creditMaxPayout } from "../../resources/transaction/service/transaction.common";
//
// // Mock dependencies if not already implemented
// const dateInstanceByTimeZone = () => new Date();
// const creditMaxPayout = async ({ params }) => {
//   console.log("Payout request:", params);
//   return { data: { success: [], failed: [] } }; // Mock response
// };
//
// // Create an instance of CustomerPayout
// const payoutInstance = new CustomerPayout();
//
// // Define mock transactionList
// const transactionList = [
//   {
//     amount: 95, // amount - serviceFee
//     accountNumber: "1234567890",
//     userId: "user1",
//     bank: "Bank A",
//     unitUniqueIdentifier: "unique-id-1",
//     bankCode: "BANK001",
//     customerName: "John Doe",
//     userWalletId: "wallet-id-1",
//     remarks: "POS Settlement",
//     serviceFee: 5,
//     terminalId: "T12345",
//     serialNumber: "SN12345",
//     amountCharged: 100,
//     gruppServiceFee: 0,
//     gruppCustomerServiceFee: 0,
//   },
// ];
//
// // Log the transactionList structure
// console.log(
//   "Transaction List Structure:",
//   JSON.stringify(transactionList, null, 2)
// );
//
// // Run the function directly for testing
// payoutInstance
//   .sendTransactionRequest({ transactionList })
//   .then((response) => {
//     logger.info(
//       `Transaction request was successful: ${JSON.stringify(response)}`
//     );
//   })
//   .catch((error) => {
//     logger.error(`Failed to send transaction request: ${error}`);
//   });

/////////////////////////////////
// UTILITY COLLATION ACCOUNT SCRIPT
// const bodyRequest: fcmbClientRegistrationRequest = {
//   requestId,
//   collection_Acct: process.env.FCMB_COLLECTION_ACCOUNT,
//   transaction_Notification_URL: "",
//   name_inquiry_URL: "",
//   account_Creation_URL: "",
//   productId,
//   appKey: process.env.FCMB_APP_KEY,
//   subscriptionKey: "",
// };
//
// const headers = {
//   client_id: process.env.FCMB_CLIENT_ID,
//   "x-token": xToken,
//   UTCTimestamp,
//   "Ocp-Apim-Subscription-Key": process.env.FCMB_SUBSCRIPTION_KEY,
// };
//
// const options = {
//   uri: `${process.env.FCMB_SERVICE_URL}/clientRegistration`,
//   method: "POST",
//   headers,
//   json: true,
//   body: bodyRequest,
// };
//
// logger.info(`======= Client Options: ${JSON.stringify(options)} ========`);
//
// return request(options)
//   .then((clientResponse: fcmbClientRegistrationResponse) => {
//     logger.info(
//       `======= Client Response: ${JSON.stringify(clientResponse)} ========`
//     );
//
//     logger.info(
//       `::: [${AccountCreationVendor.FCMB}] for phone number` +
//       `[${model.phoneNumber}] has description response [${clientResponse.description}] :::`
//     );
//
//     if (clientResponse.code === "97") {
//       logger.info(` Client Already Registered `);
//     }

// \\\\\\\\\\\\\///

// import CustomError from "../../src/api/modules/custom-error";
// import { BAD_REQUEST, FORBIDDEN } from "../../src/api/modules/status";

// it("should handle errors when fetching geolocation data", async () => {
//   const ip = "8.frs.8.8";
//   const errorMessage = "Fetching Geolocation Data Failed";
//   const statusCode = FORBIDDEN;
//
//   // geoLocationStub = sinon.stub(request, "get").rejects(errorMessage);
//
//   geoLocationStub = sinon.stub(request, "get").rejects({
//     statusCode,
//     message: errorMessage,
//   });
//
//   await expect(geoLocation(ip)).to.be.rejectedWith(CustomError, errorMessage);
//
//   // await expect(geoLocation(ip)).to.be.rejectedWith(
//   //   CustomError({
//   //     statusCode: FORBIDDEN,
//   //     message: "Fetching Geolocation Data Failed",
//   //   })
//   // );
// });
// it("should handle errors from populating ipUserInfo", async () => {
//   const errorMessage = "Geolocation Middleware Error";
//
//   geoLocationStub = sinon
//     .stub(request, "get")
//     .rejects(new Error(errorMessage));
//
//   await ipUserInfo(req, res, next);
//
//   // expect(res.send).to.have.been.calledWith(BAD_REQUEST, {
//   //   status: false,
//   //   message: "Error in geolocation middleware",
//   // });
//
//   // expect(res.send.called).to.be.true;
//   expect(res.send.callCount).to.equal(1);
//   expect(res.send.args[0][0]).to.equal(BAD_REQUEST);
//   expect(res.send.args[0][1]).to.deep.equal({
//     status: false,
//     message: "Geolocation Middleware Error",
//   });
//
//   expect(next.called).to.be.false;
// });
