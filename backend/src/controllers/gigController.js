import Gig from "../models/Gig.js";


export const createGig = async (req, res) => {
  const { title, description, budget } = req.body;

  if (!title || !description || !budget) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const gig = await Gig.create({
    title,
    description,
    budget,
    ownerId: req.user.id,
  });

  res.status(201).json(gig);
};


export const getOpenGigs = async (req, res) => {
  const keyword = req.query.search
    ? {
        title: {
          $regex: req.query.search,
          $options: "i",
        },
      }
    : {};

  const gigs = await Gig.find({
    ...keyword,
  }).populate("ownerId", "name email").populate({
    path: "hiredBidId",
    populate: {
      path: "freelancerId",
      select: "name email"
    }
  }).sort({ status: -1, createdAt: -1 });

  res.json(gigs);
};
