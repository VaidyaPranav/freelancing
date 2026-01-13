import mongoose from "mongoose";
import Bid from "../models/bid.js";
import Gig from "../models/Gig.js";


export const createBid = async (req, res) => {
  const { gigId, message, price } = req.body;

  if (!gigId || !message || !price) {
    return res.status(400).json({ message: "All fields required" });
  }

  const gig = await Gig.findById(gigId);
  if (!gig || gig.status !== "open") {
    return res.status(400).json({ message: "Gig not open for bidding" });
  }

  const bid = await Bid.create({
    gigId,
    freelancerId: req.user.id,
    message,
    price,
  });

  res.status(201).json(bid);
};



export const getBidsForGig = async (req, res) => {
  const { gigId } = req.params;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    return res.status(404).json({ message: "Gig not found" });
  }

  if (gig.ownerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const bids = await Bid.find({ gigId })
    .populate("freelancerId", "name email");

  res.json(bids);
};




export const hireBid = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.bidId).session(session);
    if (!bid) {
      throw new Error("Bid not found");
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      throw new Error("Gig not found");
    }

    if (gig.ownerId.toString() !== req.user.id) {
      throw new Error("Not authorized");
    }

    if (gig.status === "assigned") {
      throw new Error("Gig already assigned");
    }

 
    gig.status = "assigned";
    gig.hiredBidId = bid._id;
    await gig.save({ session });

 
    bid.status = "hired";
    await bid.save({ session });

   
    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bid._id },
      },
      { status: "rejected" },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Freelancer hired successfully" });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};
