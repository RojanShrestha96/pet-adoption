import SuccessStory from "../models/SuccessStory.js";

// GET ALL PUBLISHED STORIES
export const getStories = async (req, res) => {
  try {
    const { featured } = req.query;
    let query = { status: "published" };
    
    if (featured === "true") {
      query.isFeatured = true;
    }

    // Populate everything to get full names, breeds, images etc.
    const stories = await SuccessStory.find(query)
      .populate({
        path: "pet",
        select: "name breed images species",
      })
      .populate({
        path: "adopter",
        select: "name profilePicture",
      })
      .populate({
        path: "shelter",
        select: "name city",
      })
      .sort({ createdAt: -1 });

    // Transform data for frontend compatibility if needed
    const formattedStories = stories.map(s => ({
      id: s._id,
      petName: s.pet?.name || "A pet",
      petBreed: s.pet?.breed || "Lovely Breed",
      petType: s.pet?.species || "other",
      adopterName: s.adopter?.name || "A kind heart",
      shelterName: s.shelter?.name || "Our Shelter",
      location: s.shelter?.city || "Unknown",
      story: s.story,
      quote: s.quote,
      petImage: s.petImage || (s.pet?.images?.[0]) || "",
      ownerImage: s.ownerImage || s.adopter?.profilePicture || "https://i.pravatar.cc/150",
      adoptionDate: new Date(s.createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }));

    res.status(200).json(formattedStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error fetching stories" });
  }
};

// CREATE STORY (Manual/Admin)
export const createStory = async (req, res) => {
  try {
    const story = await SuccessStory.create(req.body);
    res.status(201).json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(400).json({ message: "Error creating story", error: error.message });
  }
};
