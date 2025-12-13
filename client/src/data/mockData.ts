export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit';
  breed: string;
  age: string;
  ageInMonths: number;
  size: 'small' | 'medium' | 'large';
  gender: 'male' | 'female';
  location: string;
  images: string[];
  healthStatus: 'healthy' | 'special-needs' | 'vaccinated';
  adoptionStatus: 'available' | 'pending' | 'adopted';
  description: string;
  weight: string;
  temperament: string[];
  personality: string[];
  compatibility: {
    kids: boolean;
    pets: boolean;
    apartment: boolean;
  };
  medical: {
    vaccinated: boolean;
    dewormed: boolean;
    sterilized: boolean;
    lastCheckup: string;
    notes: string;
  };
  shelter: {
    name: string;
    contact: string;
    email: string;
  };
}
export interface Shelter {
  id: string;
  name: string;
  location: string;
  distance: string;
  image: string;
  petsAvailable: number;
}
export const mockPets: Pet[] = [{
  id: '1',
  name: 'Luna',
  species: 'dog',
  breed: 'Golden Retriever Mix',
  age: '2 years',
  ageInMonths: 24,
  size: 'large',
  gender: 'female',
  location: 'Kathmandu',
  images: ['https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&h=800&fit=crop'],
  healthStatus: 'vaccinated',
  adoptionStatus: 'available',
  description: "Luna is a gentle, loving companion who adores people and playtime. She's well-trained, great with kids, and would make the perfect family dog.",
  weight: '28 kg',
  temperament: ['Friendly', 'Energetic', 'Loyal'],
  personality: ['Playful', 'Affectionate', 'Intelligent', 'Social'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: false
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    lastCheckup: '2024-01-15',
    notes: 'All vaccinations up to date. Healthy and active.'
  },
  shelter: {
    name: 'Kathmandu Animal Shelter',
    contact: '+977 98-1234567',
    email: 'info@kathmandushelter.org'
  }
}, {
  id: '2',
  name: 'Whiskers',
  species: 'cat',
  breed: 'Domestic Shorthair',
  age: '1 year',
  ageInMonths: 12,
  size: 'small',
  gender: 'male',
  location: 'Lalitpur',
  images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=800&fit=crop'],
  healthStatus: 'healthy',
  adoptionStatus: 'available',
  description: 'Whiskers is a calm, independent cat who loves cozy spots and gentle pets. Perfect for a quiet home.',
  weight: '4 kg',
  temperament: ['Calm', 'Independent', 'Affectionate'],
  personality: ['Gentle', 'Curious', 'Quiet', 'Cuddly'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: true
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    lastCheckup: '2024-02-01',
    notes: 'Healthy with no known issues.'
  },
  shelter: {
    name: 'Patan Pet Rescue',
    contact: '+977 98-2345678',
    email: 'contact@patanrescue.org'
  }
}, {
  id: '3',
  name: 'Max',
  species: 'dog',
  breed: 'German Shepherd',
  age: '3 years',
  ageInMonths: 36,
  size: 'large',
  gender: 'male',
  location: 'Bhaktapur',
  images: ['https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800&h=800&fit=crop'],
  healthStatus: 'healthy',
  adoptionStatus: 'available',
  description: 'Max is a loyal, protective companion. Well-trained and great with families who have space for an active dog.',
  weight: '35 kg',
  temperament: ['Loyal', 'Protective', 'Intelligent'],
  personality: ['Brave', 'Obedient', 'Alert', 'Confident'],
  compatibility: {
    kids: true,
    pets: false,
    apartment: false
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: false,
    lastCheckup: '2024-01-20',
    notes: 'Strong and healthy. Needs regular exercise.'
  },
  shelter: {
    name: 'Bhaktapur Animal Care',
    contact: '+977 98-3456789',
    email: 'help@bhaktapurcare.org'
  }
}, {
  id: '4',
  name: 'Bella',
  species: 'cat',
  breed: 'Persian Mix',
  age: '6 months',
  ageInMonths: 6,
  size: 'small',
  gender: 'female',
  location: 'Kathmandu',
  images: ['https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=800&fit=crop'],
  healthStatus: 'vaccinated',
  adoptionStatus: 'available',
  description: 'Bella is a playful kitten with a fluffy coat and loving personality. She loves to play and cuddle.',
  weight: '2.5 kg',
  temperament: ['Playful', 'Affectionate', 'Curious'],
  personality: ['Energetic', 'Sweet', 'Social', 'Adventurous'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: true
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: false,
    lastCheckup: '2024-02-10',
    notes: 'Young and healthy. Needs age-appropriate care.'
  },
  shelter: {
    name: 'Kathmandu Animal Shelter',
    contact: '+977 98-1234567',
    email: 'info@kathmandushelter.org'
  }
}, {
  id: '5',
  name: 'Charlie',
  species: 'dog',
  breed: 'Beagle',
  age: '1 year',
  ageInMonths: 12,
  size: 'medium',
  gender: 'male',
  location: 'Pokhara',
  images: ['https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1612536981698-808595f2f0a6?w=800&h=800&fit=crop'],
  healthStatus: 'vaccinated',
  adoptionStatus: 'available',
  description: 'Charlie is a curious, friendly beagle who loves adventures and treats. Great with kids and other pets.',
  weight: '12 kg',
  temperament: ['Curious', 'Friendly', 'Energetic'],
  personality: ['Playful', 'Food-motivated', 'Social', 'Happy'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: true
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    lastCheckup: '2024-01-25',
    notes: 'Healthy and active. Loves to explore.'
  },
  shelter: {
    name: 'Pokhara Pet Haven',
    contact: '+977 98-4567890',
    email: 'info@pokharahaven.org'
  }
}, {
  id: '6',
  name: 'Mittens',
  species: 'cat',
  breed: 'Tabby',
  age: '3 months',
  ageInMonths: 3,
  size: 'small',
  gender: 'female',
  location: 'Lalitpur',
  images: ['https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1478098711619-5ab0b478d6e6?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=800&h=800&fit=crop'],
  healthStatus: 'healthy',
  adoptionStatus: 'available',
  description: 'Mittens is a tiny, adorable kitten full of energy and curiosity. She loves to play and explore.',
  weight: '1.2 kg',
  temperament: ['Playful', 'Curious', 'Energetic'],
  personality: ['Tiny', 'Adventurous', 'Sweet', 'Mischievous'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: true
  },
  medical: {
    vaccinated: false,
    dewormed: true,
    sterilized: false,
    lastCheckup: '2024-02-15',
    notes: 'Too young for full vaccinations. Healthy kitten.'
  },
  shelter: {
    name: 'Patan Pet Rescue',
    contact: '+977 98-2345678',
    email: 'contact@patanrescue.org'
  }
}, {
  id: '7',
  name: 'Rocky',
  species: 'dog',
  breed: 'Labrador Mix',
  age: '4 years',
  ageInMonths: 48,
  size: 'large',
  gender: 'male',
  location: 'Kathmandu',
  images: ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=800&h=800&fit=crop'],
  healthStatus: 'special-needs',
  adoptionStatus: 'available',
  description: "Rocky is a gentle giant who needs special care. He's loving, calm, and would thrive in a patient home.",
  weight: '32 kg',
  temperament: ['Gentle', 'Calm', 'Patient'],
  personality: ['Sweet', 'Quiet', 'Loving', 'Relaxed'],
  compatibility: {
    kids: true,
    pets: true,
    apartment: false
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    lastCheckup: '2024-02-05',
    notes: 'Has mild hip dysplasia. Needs gentle exercise and joint supplements.'
  },
  shelter: {
    name: 'Kathmandu Animal Shelter',
    contact: '+977 98-1234567',
    email: 'info@kathmandushelter.org'
  }
}, {
  id: '8',
  name: 'Simba',
  species: 'cat',
  breed: 'Orange Tabby',
  age: '2 years',
  ageInMonths: 24,
  size: 'medium',
  gender: 'male',
  location: 'Bhaktapur',
  images: ['https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1615789591457-74a63395c990?w=800&h=800&fit=crop', 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&h=800&fit=crop'],
  healthStatus: 'healthy',
  adoptionStatus: 'pending',
  description: "Simba is a confident, social cat who loves attention. He's vocal and will let you know what he wants!",
  weight: '5 kg',
  temperament: ['Confident', 'Social', 'Vocal'],
  personality: ['Outgoing', 'Demanding', 'Affectionate', 'Playful'],
  compatibility: {
    kids: true,
    pets: false,
    apartment: true
  },
  medical: {
    vaccinated: true,
    dewormed: true,
    sterilized: true,
    lastCheckup: '2024-01-30',
    notes: 'Healthy and active. Prefers to be the only pet.'
  },
  shelter: {
    name: 'Bhaktapur Animal Care',
    contact: '+977 98-3456789',
    email: 'help@bhaktapurcare.org'
  }
}];
export const mockShelters: Shelter[] = [{
  id: '1',
  name: 'Kathmandu Animal Shelter',
  location: 'Thamel, Kathmandu',
  distance: '2.5 km',
  image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
  petsAvailable: 24
}, {
  id: '2',
  name: 'Patan Pet Rescue',
  location: 'Jawalakhel, Lalitpur',
  distance: '4.1 km',
  image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=300&fit=crop',
  petsAvailable: 18
}, {
  id: '3',
  name: 'Bhaktapur Animal Care',
  location: 'Durbar Square, Bhaktapur',
  distance: '8.3 km',
  image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=300&fit=crop',
  petsAvailable: 15
}, {
  id: '4',
  name: 'Pokhara Pet Haven',
  location: 'Lakeside, Pokhara',
  distance: '12.7 km',
  image: 'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=400&h=300&fit=crop',
  petsAvailable: 31
}];