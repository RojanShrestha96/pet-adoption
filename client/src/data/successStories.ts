export type SuccessStory = {
  id: string;
  petName: string;
  petType: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
  petBreed: string;
  petAge: string;
  adopterName: string;
  shelterName: string;
  story: string;
  quote: string;
  imageIdea: string;
  adoptionDate: string;
  petImage: string;
  ownerImage: string;
  location: string;
};

export const successStories: SuccessStory[] = [
  {
    id: '1',
    petName: 'Bella',
    petType: 'dog',
    petBreed: 'Golden Retriever Mix',
    petAge: '3 years',
    adopterName: 'Sarah & Michael',
    shelterName: 'Happy Paws Shelter',
    location: 'Austin, TX',
    adoptionDate: 'Jan 15, 2024',
    quote: "She ran to us the moment we walked in. I think she chose us, honestly.",
    story: `Bella was found wandering the streets, malnourished and scared. After months of rehabilitation at Happy Paws Shelter, she was ready for her forever home. Sarah discovered Bella through PetMate's matching system. "The application process was so smooth," Sarah recalls. Today, Bella spends her days hiking with her new family and has become the neighborhood's favorite greeter.`,
    imageIdea: 'Golden retriever playing fetch in a sunny backyard with a happy family',
    petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    petName: 'Whiskers',
    petType: 'cat',
    petBreed: 'Tabby',
    petAge: '5 years',
    adopterName: 'Emily Chen',
    shelterName: 'Feline Friends Rescue',
    location: 'Portland, OR',
    adoptionDate: 'Feb 20, 2024',
    quote: "Everyone skipped him for kittens. I couldn't understand why — he's perfect.",
    story: `Whiskers spent two years in the shelter after being surrendered when his elderly owner passed away. Emily saw something special in his detailed profile on PetMate. Now, Whiskers rules his new kingdom from his favorite sunny windowsill, and Emily can't imagine life without her gentle senior companion.`,
    imageIdea: 'Orange tabby cat lounging contentedly on a cozy window seat with plants',
    petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    petName: 'Max',
    petType: 'dog',
    petBreed: 'Pit Bull Terrier',
    petAge: '2 years',
    adopterName: 'The Rodriguez Family',
    shelterName: 'Second Chance Rescue',
    location: 'San Antonio, TX',
    adoptionDate: 'Nov 8, 2023',
    quote: "Our kids were nervous at first. Now they fight over who gets to hold his leash.",
    story: `Max came from a difficult background, rescued from neglect. The Rodriguez family was initially hesitant, but PetMate's behavioral assessments changed their minds. Max has since become a certified therapy dog, visiting hospitals and bringing joy to patients.`,
    imageIdea: 'Smiling pit bull wearing a therapy dog vest with children hugging him',
    petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    petName: 'Cinnamon',
    petType: 'rabbit',
    petBreed: 'Holland Lop',
    petAge: '1 year',
    adopterName: 'Jake Thompson',
    shelterName: 'Small Friends Sanctuary',
    location: 'Denver, CO',
    adoptionDate: 'Mar 5, 2024',
    quote: "I'd never had a pet before. She made me feel like I'd been doing this my whole life.",
    story: `Cinnamon was part of a large rescue from an overwhelmed breeder. Jake used PetMate's care guides to prepare before adopting. Now Cinnamon has her own Instagram following, showcasing daily adventures and helping others learn about rabbit adoption.`,
    imageIdea: 'Fluffy lop-eared rabbit with a young man reading on a couch',
    petImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    petName: 'Luna & Star',
    petType: 'cat',
    petBreed: 'Siamese Mix',
    petAge: '4 years',
    adopterName: 'David & James',
    shelterName: 'Whisker Haven',
    location: 'Seattle, WA',
    adoptionDate: 'Jan 28, 2024',
    quote: "We weren't going to separate them. The shelter cried. We cried. Good tears.",
    story: `Luna and Star, bonded sisters, had been passed over because adopters only wanted one cat. David and James specifically searched for bonded pairs on PetMate. Today the sisters spend their days chasing each other around and cuddling together at night.`,
    imageIdea: 'Two Siamese cats curled up together on a soft blanket with two happy men',
    petImage: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1553514029-1318c9127859?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    petName: 'Bruno',
    petType: 'dog',
    petBreed: 'Senior Beagle',
    petAge: '10 years',
    adopterName: 'Margaret Wilson',
    shelterName: 'Golden Years Pet Rescue',
    location: 'Asheville, NC',
    adoptionDate: 'Dec 12, 2023',
    quote: "He snored on my lap the whole first night. I knew we'd be just fine.",
    story: `Bruno's owner entered a care facility and couldn't take him along. At 10 years old, his chances seemed slim. Margaret specifically sought senior dogs through PetMate's age filter. Now, Bruno and Margaret take leisurely walks together and enjoy quiet afternoons in the garden.`,
    imageIdea: 'Elderly beagle resting peacefully beside an older woman reading in a garden',
    petImage: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop',
    ownerImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  },
];