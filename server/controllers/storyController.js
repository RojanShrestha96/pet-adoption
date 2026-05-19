import SuccessStory from "../models/SuccessStory.js";
import AdoptionApplication from "../models/AdoptionApplication.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/stories  (public)
// Returns all published success stories
// ─────────────────────────────────────────────────────────────────────────────
export const getStories = async (req, res) => {
  try {
    const { featured } = req.query;

    // Build query — only show published stories
    let query = { status: "published" };
    if (featured === "true") {
      query.isFeatured = true;
    }

    const stories = await SuccessStory.find(query)
      .populate({ path: "pet",     select: "name breed images species" })
      .populate({ path: "adopter", select: "name profileImage" })
      .populate({ path: "shelter", select: "name city" })
      .sort({ createdAt: -1 });

    const formatImageUrl = (url) => {
      if (!url) return "";
      return url.startsWith("http") ? url : `http://localhost:5000${url}`;
    };

    // Shape the data so the frontend always gets consistent fields
    const formatted = stories.map(s => {
      const dbOwnerImage = s.ownerImage || s.adopter?.profileImage;
      const finalOwnerImage = dbOwnerImage ? formatImageUrl(dbOwnerImage) : "https://i.pravatar.cc/150";

      const dbPetImage = s.petImage || s.pet?.images?.[0];
      const finalPetImage = formatImageUrl(dbPetImage);

      return {
        id:          s._id,
        petName:     s.pet?.name     || "A pet",
        petBreed:    s.pet?.breed    || "Mixed Breed",
        petType:     s.pet?.species  || "other",
        adopterName: s.adopter?.name || "A kind-hearted adopter",
        shelterName: s.shelter?.name || "Our Shelter",
        location:    s.shelter?.city || "Nepal",
        story:       s.story,
        quote:       s.quote,
        petImage:    finalPetImage,
        ownerImage:  finalOwnerImage,
        adoptionDate: new Date(s.createdAt).toLocaleDateString("en-US", {
          year: "numeric", month: "short", day: "numeric",
        }),
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: "Server error fetching stories" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stories/submit  (requires login)
// Called when an adopter clicks "Share Your Story" after a completed adoption
// ─────────────────────────────────────────────────────────────────────────────
export const submitStory = async (req, res) => {
  try {
    const adopterId = req.user.userId;
    const { applicationId, story, quote } = req.body;

    // Basic validation
    if (!applicationId || !story) {
      return res.status(400).json({ message: "applicationId and story are required." });
    }

    // Make sure this application belongs to the logged-in user and is completed
    const application = await AdoptionApplication.findOne({
      _id:     applicationId,
      adopter: adopterId,
      status:  "completed",
    })
      .populate("pet",     "name breed images species")
      .populate("adopter", "name profileImage")
      .populate("shelter", "_id name city");

    if (!application) {
      return res.status(404).json({
        message: "No completed adoption found for this application. Only completed adoptions can have a story.",
      });
    }

    // Check if a story already exists for this application
    const existing = await SuccessStory.findOne({ application: applicationId });
    if (existing) {
      return res.status(409).json({ message: "A story already exists for this adoption." });
    }

    // Create the story — pull pet/adopter/shelter info automatically
    const newStory = await SuccessStory.create({
      application: application._id,
      pet:         application.pet._id,
      adopter:     adopterId,
      shelter:     application.shelter._id,
      story:       story.trim(),
      quote:       quote?.trim() || "A perfect match made on PetMate!",
      petImage:    application.pet.images?.[0] || "",
      ownerImage:  application.adopter?.profileImage || "",
      isFeatured:  true,
      status:      "published",
    });

    res.status(201).json({ message: "Story submitted successfully!", story: newStory });
  } catch (error) {
    console.error("Error submitting story:", error);
    res.status(500).json({ message: "Server error submitting story" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/stories  (admin/manual — kept for backwards compatibility)
// ─────────────────────────────────────────────────────────────────────────────
export const createStory = async (req, res) => {
  try {
    const story = await SuccessStory.create(req.body);
    res.status(201).json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(400).json({ message: "Error creating story", error: error.message });
  }
};
