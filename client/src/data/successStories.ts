export type SuccessStory = {
  id: string;
  petName: string;
  petType: 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';
  petBreed: string;
  petAge: string;
  adopterName: string;
  shelterName: string;
  story: string;
  imageIdea: string;
  adoptionDate: string;
  petImage: string;
};
export const successStories: SuccessStory[] = [{
  id: '1',
  petName: 'Bella',
  petType: 'dog',
  petBreed: 'Golden Retriever Mix',
  petAge: '3 years',
  adopterName: 'Sarah & Michael',
  shelterName: 'Happy Paws Shelter',
  story: `Bella was found wandering the streets, malnourished and scared. After months of rehabilitation at Happy Paws Shelter, she was ready for her forever home. Sarah discovered Bella through PetMate's matching system, which highlighted their compatible lifestyles. "The application process was so smooth," Sarah recalls. "We received updates at every step, and the shelter staff were incredibly supportive." Today, Bella spends her days hiking with her new family and has become the neighborhood's favorite greeter. Her transformation from a timid rescue to a confident, loving companion reminds us why adoption matters.`,
  imageIdea: 'Golden retriever playing fetch in a sunny backyard with a happy family',
  adoptionDate: '2024-01-15',
  petImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
}, {
  id: '2',
  petName: 'Whiskers',
  petType: 'cat',
  petBreed: 'Tabby',
  petAge: '5 years',
  adopterName: 'Emily Chen',
  shelterName: 'Feline Friends Rescue',
  story: `Whiskers spent two years in the shelter after being surrendered when his elderly owner passed away. Many overlooked him for younger cats, but Emily saw something special. "PetMate's detailed profiles helped me understand his personality," she shares. "I knew he'd be perfect for my quiet apartment." The platform's messaging feature allowed Emily to ask the shelter questions before visiting. Now, Whiskers rules his new kingdom from his favorite sunny windowsill, and Emily can't imagine life without her gentle senior companion. Sometimes the best matches take a little longer to find.`,
  imageIdea: 'Orange tabby cat lounging contentedly on a cozy window seat with plants',
  adoptionDate: '2024-02-20',
  petImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
}, {
  id: '3',
  petName: 'Max',
  petType: 'dog',
  petBreed: 'Pit Bull Terrier',
  petAge: '2 years',
  adopterName: 'The Rodriguez Family',
  shelterName: 'Second Chance Animal Rescue',
  story: `Max came from a difficult background, rescued from a neglect situation. Despite his past, his sweet nature shone through. The Rodriguez family was initially hesitant about adopting a pit bull, but PetMate's comprehensive behavioral assessments and the shelter's transparency changed their minds. "The meet-and-greet scheduling through the app made everything easy," says Maria Rodriguez. "We could see Max was gentle with our kids from the first visit." Max has since become a certified therapy dog, visiting hospitals and bringing joy to patients. His story proves that every pet deserves a second chance.`,
  imageIdea: 'Smiling pit bull wearing a therapy dog vest with children hugging him',
  adoptionDate: '2023-11-08',
  petImage: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'
}, {
  id: '4',
  petName: 'Cinnamon',
  petType: 'rabbit',
  petBreed: 'Holland Lop',
  petAge: '1 year',
  adopterName: 'Jake Thompson',
  shelterName: 'Small Friends Sanctuary',
  story: `Cinnamon was part of a large rescue from an overwhelmed breeder. Jake, a first-time pet owner, used PetMate's educational resources to learn about rabbit care before adopting. "The platform's care guides were invaluable," he explains. "I felt prepared and confident." The shelter appreciated PetMate's thorough application process, ensuring Cinnamon went to a knowledgeable home. Now, Cinnamon has her own Instagram following, showcasing her daily adventures and helping educate others about rabbit adoption. She's proof that small pets make big impacts on our lives.`,
  imageIdea: 'Fluffy lop-eared rabbit in a cozy indoor setup with toys and fresh vegetables',
  adoptionDate: '2024-03-05',
  petImage: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400'
}, {
  id: '5',
  petName: 'Luna & Star',
  petType: 'cat',
  petBreed: 'Siamese Mix',
  petAge: '4 years',
  adopterName: 'David & James',
  shelterName: 'Whisker Haven',
  story: `Luna and Star, bonded sisters, had been passed over multiple times because adopters only wanted one cat. David and James specifically searched for bonded pairs on PetMate. "The filter options helped us find exactly what we were looking for," David shares. The shelter was thrilled to keep the sisters together. The adoption workflow kept everyone informed, from application to home visit to final approval. Today, Luna and Star spend their days chasing each other around their new home and cuddling together at night. Their story shows that sometimes, love comes in pairs.`,
  imageIdea: 'Two Siamese cats curled up together on a soft blanket, looking content',
  adoptionDate: '2024-01-28',
  petImage: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400'
}, {
  id: '6',
  petName: 'Bruno',
  petType: 'dog',
  petBreed: 'Senior Beagle',
  petAge: '10 years',
  adopterName: 'Margaret Wilson',
  shelterName: 'Golden Years Pet Rescue',
  story: `Bruno's owner entered a care facility and couldn't take him along. At 10 years old, his chances of adoption seemed slim. Margaret, a retired teacher, specifically sought senior dogs through PetMate's age filter. "I wanted a calm companion for my golden years," she says. The platform's medical records feature gave her confidence about Bruno's health needs. The shelter's detailed history helped Margaret understand his routine. Now, Bruno and Margaret take leisurely walks together and enjoy quiet afternoons in the garden. Senior pets have so much love to give—they just need someone to see it.`,
  imageIdea: 'Elderly beagle resting peacefully beside an older woman reading in a garden',
  adoptionDate: '2023-12-12',
  petImage: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=400'
}];