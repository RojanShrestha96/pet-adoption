import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, MessageSquare, XCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ApplicationTimeline, ApplicationStatus } from '../components/ApplicationTimeline';
import { mockPets } from '../data/mockData';
export function ApplicationTrackingPage() {
  const {
    applicationId
  } = useParams();
  const navigate = useNavigate();
  // Mock data
  const pet = mockPets[0];
  const currentStatus: ApplicationStatus = 'under-review';
  return <div className="min-h-screen py-8 px-4" style={{
    background: 'var(--color-background)'
  }}>
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-6 transition-colors" style={{
        color: 'var(--color-text-light)'
      }}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{
          color: 'var(--color-text)'
        }}>
            Track Your Application
          </h1>
          <p style={{
          color: 'var(--color-text-light)'
        }}>
            Application ID: #{applicationId}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <h2 className="text-2xl font-bold mb-6" style={{
              color: 'var(--color-text)'
            }}>
                Application Status
              </h2>
              <ApplicationTimeline currentStatus={currentStatus} />
            </Card>

            {/* Actions */}
            <div className="mt-6 space-y-4">
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1" style={{
                    color: 'var(--color-text)'
                  }}>
                      Upload Additional Documents
                    </h3>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Add any supporting files
                    </p>
                  </div>
                  <Button variant="outline" icon={<Upload className="w-4 h-4" />}>
                    Upload
                  </Button>
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1" style={{
                    color: 'var(--color-text)'
                  }}>
                      Message Shelter
                    </h3>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Ask questions or provide updates
                    </p>
                  </div>
                  <Button variant="outline" icon={<MessageSquare className="w-4 h-4" />}>
                    Message
                  </Button>
                </div>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold mb-1" style={{
                    color: 'var(--color-error)'
                  }}>
                      Cancel Request
                    </h3>
                    <p className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                      Withdraw your application
                    </p>
                  </div>
                  <Button variant="outline" icon={<XCircle className="w-4 h-4" />} style={{
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)'
                }}>
                    Cancel
                  </Button>
                </div>
              </Card>
            </div>
          </div>

          {/* Pet Info Sidebar */}
          <div>
            <Card padding="lg">
              <h3 className="font-semibold mb-4" style={{
              color: 'var(--color-text)'
            }}>
                Pet Details
              </h3>
              <img src={pet.images[0]} alt={pet.name} className="w-full h-48 object-cover rounded-xl mb-4" />
              <h4 className="text-xl font-bold mb-2" style={{
              color: 'var(--color-text)'
            }}>
                {pet.name}
              </h4>
              <p className="mb-4" style={{
              color: 'var(--color-text-light)'
            }}>
                {pet.breed} • {pet.age}
              </p>
              <div className="space-y-2 text-sm" style={{
              color: 'var(--color-text-light)'
            }}>
                <p>
                  <strong>Location:</strong> {pet.location}
                </p>
                <p>
                  <strong>Size:</strong> {pet.size}
                </p>
                <p>
                  <strong>Gender:</strong> {pet.gender}
                </p>
              </div>
            </Card>

            <Card padding="lg" className="mt-4">
              <h3 className="font-semibold mb-3" style={{
              color: 'var(--color-text)'
            }}>
                Shelter Contact
              </h3>
              <div className="space-y-2 text-sm" style={{
              color: 'var(--color-text-light)'
            }}>
                <p>
                  <strong>{pet.shelter.name}</strong>
                </p>
                <p>{pet.shelter.contact}</p>
                <p>{pet.shelter.email}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}