import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Check, DollarSign, Smartphone, Building2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
export function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(500);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'khalti' | 'bank' | null>(null);
  const donationAmounts = [{
    amount: 500,
    impact: 'Feed 5 pets for a day'
  }, {
    amount: 1000,
    impact: 'Vaccinate 2 pets'
  }, {
    amount: 2500,
    impact: 'Medical care for 1 pet'
  }, {
    amount: 5000,
    impact: 'Support a shelter for a week'
  }];
  const paymentMethods = [{
    id: 'esewa' as const,
    name: 'eSewa',
    icon: Smartphone,
    color: '#60BB46'
  }, {
    id: 'khalti' as const,
    name: 'Khalti',
    icon: Smartphone,
    color: '#5C2D91'
  }, {
    id: 'bank' as const,
    name: 'Bank Transfer',
    icon: Building2,
    color: 'var(--color-secondary)'
  }];
  const handleDonate = () => {
    const amount = selectedAmount || parseInt(customAmount);
    if (amount && paymentMethod) {
      alert(`Processing donation of NPR ${amount} via ${paymentMethod}`);
    }
  };
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden" style={{
      background: 'var(--color-surface)'
    }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }}>
            <motion.div initial={{
            scale: 0
          }} animate={{
            scale: 1
          }} transition={{
            duration: 0.5,
            delay: 0.2
          }} className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{
            background: 'var(--color-primary)'
          }}>
              <Heart className="w-10 h-10 text-white" fill="white" />
            </motion.div>

            <h1 className="text-5xl font-bold mb-6" style={{
            color: 'var(--color-text)'
          }}>
              Help Us Save More Lives
            </h1>
            <p className="text-xl leading-relaxed mb-8" style={{
            color: 'var(--color-text-light)'
          }}>
              Your donation helps provide food, medical care, and shelter to
              pets in need. Every contribution makes a real difference in a
              pet's life.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16" style={{
      background: 'var(--color-background)'
    }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Donation Form */}
            <div className="lg:col-span-2">
              <Card padding="lg">
                <h2 className="text-2xl font-bold mb-6" style={{
                color: 'var(--color-text)'
              }}>
                  Choose Your Donation Amount
                </h2>

                {/* Preset Amounts */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {donationAmounts.map((option, index) => <motion.button key={option.amount} initial={{
                  opacity: 0,
                  y: 20
                }} animate={{
                  opacity: 1,
                  y: 0
                }} transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }} onClick={() => {
                  setSelectedAmount(option.amount);
                  setCustomAmount('');
                }} className="p-6 rounded-2xl text-left transition-all hover:scale-[1.02]" style={{
                  background: selectedAmount === option.amount ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: selectedAmount === option.amount ? 'white' : 'var(--color-text)',
                  border: selectedAmount === option.amount ? '2px solid var(--color-primary)' : '2px solid var(--color-border)'
                }}>
                      <div className="text-3xl font-bold mb-2">
                        NPR {option.amount}
                      </div>
                      <div className="text-sm opacity-90">{option.impact}</div>
                    </motion.button>)}
                </div>

                {/* Custom Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-2" style={{
                  color: 'var(--color-text)'
                }}>
                    Or enter a custom amount
                  </label>
                  <Input type="number" placeholder="Enter amount in NPR" value={customAmount} onChange={e => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }} icon={<DollarSign className="w-5 h-5" />} fullWidth />
                </div>

                {/* Payment Methods */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4" style={{
                  color: 'var(--color-text)'
                }}>
                    Select Payment Method
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return <button key={method.id} onClick={() => setPaymentMethod(method.id)} className="p-6 rounded-2xl transition-all hover:scale-[1.02]" style={{
                      background: paymentMethod === method.id ? 'var(--color-surface)' : 'var(--color-card)',
                      border: paymentMethod === method.id ? '2px solid var(--color-primary)' : '2px solid var(--color-border)'
                    }}>
                          <Icon className="w-8 h-8 mx-auto mb-3" style={{
                        color: method.color
                      }} />
                          <div className="font-semibold" style={{
                        color: 'var(--color-text)'
                      }}>
                            {method.name}
                          </div>
                        </button>;
                  })}
                  </div>
                </div>

                {/* Donate Button */}
                <Button variant="primary" size="lg" fullWidth icon={<Heart className="w-5 h-5" />} onClick={handleDonate} disabled={!(selectedAmount || customAmount) || !paymentMethod}>
                  Donate Now
                </Button>
              </Card>
            </div>

            {/* Impact Sidebar */}
            <div className="space-y-6">
              <Card padding="lg">
                <h3 className="text-xl font-bold mb-4" style={{
                color: 'var(--color-text)'
              }}>
                  Your Impact
                </h3>
                <div className="space-y-4">
                  {[{
                  amount: 'NPR 500',
                  impact: 'Feeds 5 pets for a day'
                }, {
                  amount: 'NPR 1,000',
                  impact: 'Provides vaccinations'
                }, {
                  amount: 'NPR 2,500',
                  impact: 'Covers medical treatment'
                }, {
                  amount: 'NPR 5,000',
                  impact: 'Supports shelter operations'
                }].map((item, index) => <motion.div key={index} initial={{
                  opacity: 0,
                  x: 20
                }} animate={{
                  opacity: 1,
                  x: 0
                }} transition={{
                  duration: 0.4,
                  delay: index * 0.1
                }} className="flex items-start gap-3">
                      <Check className="w-5 h-5 mt-0.5 flex-shrink-0" style={{
                    color: 'var(--color-success)'
                  }} />
                      <div>
                        <div className="font-semibold text-sm" style={{
                      color: 'var(--color-text)'
                    }}>
                          {item.amount}
                        </div>
                        <div className="text-sm" style={{
                      color: 'var(--color-text-light)'
                    }}>
                          {item.impact}
                        </div>
                      </div>
                    </motion.div>)}
                </div>
              </Card>

              <Card padding="lg">
                <h3 className="text-xl font-bold mb-4" style={{
                color: 'var(--color-text)'
              }}>
                  Why Donate?
                </h3>
                <div className="space-y-3 text-sm" style={{
                color: 'var(--color-text-light)'
              }}>
                  <p>
                    <strong style={{
                    color: 'var(--color-text)'
                  }}>
                      100% of donations
                    </strong>{' '}
                    go directly to pet care and shelter operations.
                  </p>
                  <p>
                    Your contribution helps provide food, medical care,
                    vaccinations, and safe shelter for pets waiting for their
                    forever homes.
                  </p>
                  <p>
                    Together, we've helped{' '}
                    <strong style={{
                    color: 'var(--color-text)'
                  }}>
                      500+ pets
                    </strong>{' '}
                    find loving families.
                  </p>
                </div>
              </Card>

              <Card padding="lg">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{
                  color: 'var(--color-primary)'
                }}>
                    NPR 2.5M+
                  </div>
                  <div className="text-sm" style={{
                  color: 'var(--color-text-light)'
                }}>
                    Raised this year
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16" style={{
      background: 'var(--color-surface)'
    }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{
          color: 'var(--color-text)'
        }}>
            Stories from Our Donors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
            name: 'Priya Sharma',
            quote: 'Knowing my donation helps feed and care for pets brings me so much joy.',
            amount: 'Monthly Donor'
          }, {
            name: 'Rajesh Kumar',
            quote: 'I adopted my dog from PetMate. Now I donate to help other pets find homes.',
            amount: 'NPR 5,000'
          }, {
            name: 'Sita Thapa',
            quote: "Every rupee counts. I'm proud to support this amazing cause.",
            amount: 'NPR 1,000'
          }].map((testimonial, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5,
            delay: index * 0.1
          }} viewport={{
            once: true
          }}>
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
                  background: 'var(--color-primary)',
                  opacity: 0.1
                }}>
                      <Heart className="w-6 h-6" style={{
                    color: 'var(--color-primary)'
                  }} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{
                    color: 'var(--color-text)'
                  }}>
                        {testimonial.name}
                      </div>
                      <div className="text-sm" style={{
                    color: 'var(--color-text-light)'
                  }}>
                        {testimonial.amount}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm italic" style={{
                color: 'var(--color-text-light)'
              }}>
                    "{testimonial.quote}"
                  </p>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16" style={{
      background: 'var(--color-background)'
    }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12" style={{
          color: 'var(--color-text)'
        }}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[{
            question: 'Is my donation tax-deductible?',
            answer: 'Yes, PetMate is a registered non-profit organization. You will receive a receipt for tax purposes.'
          }, {
            question: 'How is my donation used?',
            answer: '100% of donations go directly to pet care including food, medical treatment, vaccinations, and shelter maintenance.'
          }, {
            question: 'Can I donate monthly?',
            answer: 'Yes! Monthly donations help us plan better and provide consistent care. Contact us to set up recurring donations.'
          }, {
            question: 'Are donations secure?',
            answer: 'Absolutely. We use secure payment gateways (eSewa, Khalti) that encrypt your information.'
          }].map((faq, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.4,
            delay: index * 0.05
          }} viewport={{
            once: true
          }}>
                <Card padding="lg">
                  <h3 className="font-semibold mb-2" style={{
                color: 'var(--color-text)'
              }}>
                    {faq.question}
                  </h3>
                  <p className="text-sm" style={{
                color: 'var(--color-text-light)'
              }}>
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </section>
    </div>;
}