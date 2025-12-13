import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PetCard } from '../components/PetCard';
import { Button } from '../components/Button';
import { mockPets } from '../data/mockData';
export function FavouritesPage() {
  const [favouritePets, setFavouritePets] = useState<typeof mockPets>([]);
  useEffect(() => {
    const favouriteIds = JSON.parse(localStorage.getItem('petmate-favourites') || '[]');
    const pets = mockPets.filter(pet => favouriteIds.includes(pet.id));
    setFavouritePets(pets);
  }, []);
  const handleRemoveAll = () => {
    if (window.confirm('Remove all favourites?')) {
      localStorage.setItem('petmate-favourites', '[]');
      setFavouritePets([]);
    }
  };
  return <div className="min-h-screen py-12" style={{
    background: 'var(--color-background)'
  }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl" style={{
              background: 'var(--color-primary)',
              color: 'white'
            }}>
                <Heart className="w-6 h-6" fill="currentColor" />
              </div>
              <div>
                <h1 className="text-4xl font-bold" style={{
                color: 'var(--color-text)'
              }}>
                  My Favourites
                </h1>
                <p style={{
                color: 'var(--color-text-light)'
              }}>
                  {favouritePets.length}{' '}
                  {favouritePets.length === 1 ? 'pet' : 'pets'} saved
                </p>
              </div>
            </div>

            {favouritePets.length > 0 && <Button variant="outline" icon={<Trash2 className="w-4 h-4" />} onClick={handleRemoveAll}>
                Clear All
              </Button>}
          </div>

          {favouritePets.length === 0 ? <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.5
        }} className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6" style={{
            background: 'var(--color-surface)'
          }}>
                <Heart className="w-12 h-12" style={{
              color: 'var(--color-text-light)'
            }} />
              </div>
              <h2 className="text-2xl font-bold mb-3" style={{
            color: 'var(--color-text)'
          }}>
                No favourites yet
              </h2>
              <p className="mb-8" style={{
            color: 'var(--color-text-light)'
          }}>
                Start browsing pets and save your favourites here
              </p>
              <Link to="/search">
                <Button variant="primary" size="lg">
                  Browse Pets
                </Button>
              </Link>
            </motion.div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favouritePets.map((pet, index) => <PetCard key={pet.id} pet={pet} index={index} />)}
            </div>}
        </motion.div>
      </div>
    </div>;
}