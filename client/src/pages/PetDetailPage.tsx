import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Weight, Heart, Phone, Mail, ArrowLeft, Home, Users, PawPrint, Activity, Ruler } from 'lucide-react';
import { PetGallery } from '../components/PetGallery';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { FavouriteButton } from '../components/FavouriteButton';
import { MedicalRecord } from '../components/MedicalRecord';
import { AdoptionSteps } from '../components/AdoptionSteps';
import { MapView } from '../components/MapView';
import { AdoptionModal } from '../components/AdoptionModal';
import { mockPets } from '../data/mockData';
export function PetDetailPage() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const pet = mockPets.find(p => p.id === id);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  // Check if user has already applied (mock - in real app, check from backend/localStorage)
  const hasAlreadyApplied = localStorage.getItem(`applied-${id}`) === 'true';
  const handleAdoptClick = () => {
    if (hasAlreadyApplied) {
      navigate(`/application-submitted/${id}`);
    } else {
      setShowAdoptionModal(true);
    }
  };
  const handleAdoptionSubmit = () => {
    localStorage.setItem(`applied-${id}`, 'true');
    navigate(`/application-tracking/1`);
  };
  if (!pet) {
    return <div className="min-h-screen flex items-center justify-center" style={{
      background: 'var(--color-background)'
    }}>
        <div className="text-center">
          <PawPrint className="w-16 h-16 mx-auto mb-4" style={{
          color: 'var(--color-text-light)'
        }} />
          <h1 className="text-2xl font-bold mb-4" style={{
          color: 'var(--color-text)'
        }}>
            Pet not found
          </h1>
          <Link to="/search">
            <Button variant="primary">Back to Search</Button>
          </Link>
        </div>
      </div>;
  }
  const healthVariant = {
    healthy: 'success' as const,
    'special-needs': 'warning' as const,
    vaccinated: 'info' as const
  };
  return <div className="min-h-screen py-8" style={{
    background: 'var(--color-background)'
  }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to="/search">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />} className="mb-6">
            Back to Search
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
              <PetGallery images={pet.images} petName={pet.name} />
            </motion.div>

            {/* Description */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.1
          }} className="p-6" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <h2 className="text-2xl font-bold mb-4" style={{
              color: 'var(--color-text)'
            }}>
                About {pet.name}
              </h2>
              <p className="text-lg leading-relaxed" style={{
              color: 'var(--color-text-light)'
            }}>
                {pet.description}
              </p>
            </motion.div>

            {/* Location Map */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.15
          }}>
              <MapView location={`${pet.shelter.name}, ${pet.location}`} className="h-64" />
            </motion.div>

            {/* Personality & Temperament */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="p-6" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6" style={{
                color: 'var(--color-primary)'
              }} />
                <h3 className="text-xl font-bold" style={{
                color: 'var(--color-text)'
              }}>
                  Personality & Temperament
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2" style={{
                  color: 'var(--color-text)'
                }}>
                    Temperament
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pet.temperament.map(trait => <Badge key={trait} variant="info">
                        {trait}
                      </Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2" style={{
                  color: 'var(--color-text)'
                }}>
                    Personality Traits
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {pet.personality.map(trait => <Badge key={trait} variant="neutral">
                        {trait}
                      </Badge>)}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Compatibility */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.3
          }} className="p-6" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <h3 className="text-xl font-bold mb-6" style={{
              color: 'var(--color-text)'
            }}>
                Compatibility & Home Requirements
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                  background: pet.compatibility.kids ? 'var(--color-success)' : 'var(--color-error)',
                  opacity: 0.15
                }}>
                    <Users className="w-10 h-10" style={{
                    color: pet.compatibility.kids ? 'var(--color-success)' : 'var(--color-error)'
                  }} />
                  </div>
                  <p className="font-semibold mb-1" style={{
                  color: 'var(--color-text)'
                }}>
                    Good with Kids
                  </p>
                  <p className="text-sm font-medium" style={{
                  color: pet.compatibility.kids ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                    {pet.compatibility.kids ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                  background: pet.compatibility.pets ? 'var(--color-success)' : 'var(--color-error)',
                  opacity: 0.15
                }}>
                    <PawPrint className="w-10 h-10" style={{
                    color: pet.compatibility.pets ? 'var(--color-success)' : 'var(--color-error)'
                  }} />
                  </div>
                  <p className="font-semibold mb-1" style={{
                  color: 'var(--color-text)'
                }}>
                    Good with Pets
                  </p>
                  <p className="text-sm font-medium" style={{
                  color: pet.compatibility.pets ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                    {pet.compatibility.pets ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center" style={{
                  background: pet.compatibility.apartment ? 'var(--color-success)' : 'var(--color-error)',
                  opacity: 0.15
                }}>
                    <Home className="w-10 h-10" style={{
                    color: pet.compatibility.apartment ? 'var(--color-success)' : 'var(--color-error)'
                  }} />
                  </div>
                  <p className="font-semibold mb-1" style={{
                  color: 'var(--color-text)'
                }}>
                    Apartment Friendly
                  </p>
                  <p className="text-sm font-medium" style={{
                  color: pet.compatibility.apartment ? 'var(--color-success)' : 'var(--color-error)'
                }}>
                    {pet.compatibility.apartment ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Medical Record */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.4
          }}>
              <MedicalRecord medical={pet.medical} />
            </motion.div>

            {/* Behaviour Notes */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: 0.5
          }} className="p-6" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <h3 className="text-xl font-bold mb-4" style={{
              color: 'var(--color-text)'
            }}>
                Behaviour Notes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg mt-1" style={{
                  background: 'var(--color-primary)',
                  opacity: 0.1
                }}>
                    <Activity className="w-5 h-5" style={{
                    color: 'var(--color-primary)'
                  }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{
                    color: 'var(--color-text)'
                  }}>
                      Energy Level
                    </p>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      {pet.temperament.includes('Energetic') ? 'High - Needs regular exercise and playtime' : pet.temperament.includes('Calm') ? 'Low - Enjoys relaxed activities' : 'Medium - Balanced activity level'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg mt-1" style={{
                  background: 'var(--color-secondary)',
                  opacity: 0.1
                }}>
                    <Users className="w-5 h-5" style={{
                    color: 'var(--color-secondary)'
                  }} />
                  </div>
                  <div>
                    <p className="font-semibold mb-1" style={{
                    color: 'var(--color-text)'
                  }}>
                      Social Behaviour
                    </p>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      {pet.temperament.includes('Social') || pet.temperament.includes('Friendly') ? 'Very social and loves meeting new people and pets' : 'Prefers familiar faces and calm environments'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Quick Info & CTA */}
          <div className="space-y-6">
            {/* Main Info Card */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5
          }} className="p-6 sticky top-24" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)'
          }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{
                  color: 'var(--color-text)'
                }}>
                    {pet.name}
                  </h1>
                  <p className="text-lg" style={{
                  color: 'var(--color-text-light)'
                }}>
                    {pet.breed}
                  </p>
                </div>
                <FavouriteButton petId={pet.id} size="lg" />
              </div>

              <div className="flex gap-2 mb-6">
                <Badge variant={healthVariant[pet.healthStatus]}>
                  {pet.healthStatus === 'special-needs' ? 'Special Needs' : pet.healthStatus}
                </Badge>
                {pet.adoptionStatus === 'pending' && <Badge variant="warning">Pending</Badge>}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{
                  background: 'var(--color-primary)',
                  opacity: 0.1
                }}>
                    <Calendar className="w-5 h-5" style={{
                    color: 'var(--color-primary)'
                  }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Age
                    </p>
                    <p className="font-semibold" style={{
                    color: 'var(--color-text)'
                  }}>
                      {pet.age}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{
                  background: 'var(--color-secondary)',
                  opacity: 0.1
                }}>
                    <Weight className="w-5 h-5" style={{
                    color: 'var(--color-secondary)'
                  }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Weight
                    </p>
                    <p className="font-semibold" style={{
                    color: 'var(--color-text)'
                  }}>
                      {pet.weight}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{
                  background: 'var(--color-accent)',
                  opacity: 0.1
                }}>
                    <Ruler className="w-5 h-5" style={{
                    color: 'var(--color-accent)'
                  }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Size
                    </p>
                    <p className="font-semibold capitalize" style={{
                    color: 'var(--color-text)'
                  }}>
                      {pet.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg" style={{
                  background: 'var(--color-success)',
                  opacity: 0.1
                }}>
                    <MapPin className="w-5 h-5" style={{
                    color: 'var(--color-success)'
                  }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Location
                    </p>
                    <p className="font-semibold" style={{
                    color: 'var(--color-text)'
                  }}>
                      {pet.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adoption CTA */}
              <Button variant="primary" fullWidth size="lg" icon={<Heart className="w-5 h-5" />} disabled={pet.adoptionStatus !== 'available'} onClick={handleAdoptClick}>
                {hasAlreadyApplied ? 'View Application' : pet.adoptionStatus === 'available' ? 'Adopt Me' : 'Not Available'}
              </Button>

              {/* Shelter Contact */}
              <div className="mt-6 pt-6 space-y-3" style={{
              borderTop: '1px solid var(--color-border)'
            }}>
                <h4 className="font-semibold" style={{
                color: 'var(--color-text)'
              }}>
                  Contact Shelter
                </h4>
                <p className="font-medium" style={{
                color: 'var(--color-text)'
              }}>
                  {pet.shelter.name}
                </p>
                <div className="space-y-2">
                  <a href={`tel:${pet.shelter.contact}`} className="flex items-center gap-2 text-sm hover:underline transition-colors" style={{
                  color: 'var(--color-primary)'
                }}>
                    <Phone className="w-4 h-4" />
                    {pet.shelter.contact}
                  </a>
                  <a href={`mailto:${pet.shelter.email}`} className="flex items-center gap-2 text-sm hover:underline transition-colors" style={{
                  color: 'var(--color-primary)'
                }}>
                    <Mail className="w-4 h-4" />
                    {pet.shelter.email}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Adoption Steps */}
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="p-6" style={{
            background: 'var(--color-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
              <AdoptionSteps />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Adoption Modal */}
      <AdoptionModal pet={pet} isOpen={showAdoptionModal} onClose={() => setShowAdoptionModal(false)} onSubmit={handleAdoptionSubmit} />
    </div>;
}