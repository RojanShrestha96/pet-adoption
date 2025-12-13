import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Grid, List, Plus, Edit2, Trash2, CheckCircle, 
  Eye, Heart, Dog, Cat, Rabbit, Filter,
  ChevronDown, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShelterSidebar } from '../components/ShelterSidebar';
import { HamburgerMenu } from '../components/HamburgerMenu';
import { NotificationCenter } from '../components/NotificationCenter';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/EmptyState';
import { PetDocBadge } from '../components/PetDocBadge';
import { mockPets } from '../data/mockData';


type ViewMode = 'grid' | 'list';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'other';
type StatusFilter = 'all' | 'available' | 'pending' | 'adopted';

export function PetsManagementPage() {
  const { showToast } = useToast();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedPet, setSelectedPet] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdoptConfirm, setShowAdoptConfirm] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter pets
  const filteredPets = useMemo(() => {
    return mockPets.filter(pet => {
      // Search filter
      const matchesSearch = 
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Species filter
      const matchesSpecies = 
        speciesFilter === 'all' ||
        (speciesFilter === 'other' 
          ? !['dog', 'cat'].includes(pet.species) 
          : pet.species === speciesFilter);
      
      // Status filter
      const matchesStatus = 
        statusFilter === 'all' || pet.adoptionStatus === statusFilter;
      
      return matchesSearch && matchesSpecies && matchesStatus;
    });
  }, [searchQuery, speciesFilter, statusFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: mockPets.length,
    available: mockPets.filter(p => p.adoptionStatus === 'available').length,
    pending: mockPets.filter(p => p.adoptionStatus === 'pending').length,
    adopted: mockPets.filter(p => p.adoptionStatus === 'adopted').length,
    dogs: mockPets.filter(p => p.species === 'dog').length,
    cats: mockPets.filter(p => p.species === 'cat').length,
  }), []);

  const handleDelete = () => {
    if (!selectedPet) return;
    showToast('Pet deleted successfully', 'success');
    setShowDeleteConfirm(false);
    setSelectedPet(null);
  };

  const handleMarkAdopted = () => {
    showToast('Pet marked as adopted! 🎉', 'success');
    setShowAdoptConfirm(false);
    setSelectedPet(null);
  };

  const speciesButtons = [
    { value: 'all' as const, label: 'All', icon: null, count: stats.total },
    { value: 'dog' as const, label: 'Dogs', icon: Dog, count: stats.dogs },
    { value: 'cat' as const, label: 'Cats', icon: Cat, count: stats.cats },
    { value: 'other' as const, label: 'Others', icon: Rabbit, count: stats.total - stats.dogs - stats.cats },
  ];

  const statusButtons = [
    { value: 'all' as const, label: 'All' },
    { value: 'available' as const, label: 'Available' },
    { value: 'pending' as const, label: 'Pending' },
    { value: 'adopted' as const, label: 'Adopted' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden lg:block">
        <ShelterSidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <HamburgerMenu />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Manage Pets</h1>
              <p className="text-sm text-gray-500 hidden sm:block">
                {filteredPets.length} of {stats.total} pets shown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationCenter />
            <Link to="/shelter/add-pet">
              <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
                <span className="hidden sm:inline">Add New Pet</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Pets', value: stats.total, color: 'bg-blue-500' },
                { label: 'Available', value: stats.available, color: 'bg-green-500' },
                { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
                { label: 'Adopted', value: stats.adopted, color: 'bg-purple-500' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or breed..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Desktop Filters */}
                <div className="hidden lg:flex items-center gap-3">
                  {/* Species Filter */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {speciesButtons.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setSpeciesFilter(btn.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          speciesFilter === btn.value
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {btn.icon && <btn.icon className="w-4 h-4" />}
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200" />

                  {/* Status Filter */}
                  <div className="flex items-center gap-1">
                    {statusButtons.map((btn) => (
                      <button
                        key={btn.value}
                        onClick={() => setStatusFilter(btn.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          statusFilter === btn.value
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="w-px h-8 bg-gray-200" />

                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'grid'
                          ? 'bg-white text-[var(--color-primary)] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="Grid view"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === 'list'
                          ? 'bg-white text-[var(--color-primary)] shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      title="List view"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile Filters Dropdown */}
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden overflow-hidden"
                  >
                    <div className="pt-4 space-y-4 border-t border-gray-100 mt-4">
                      {/* Species */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">SPECIES</p>
                        <div className="flex flex-wrap gap-2">
                          {speciesButtons.map((btn) => (
                            <button
                              key={btn.value}
                              onClick={() => setSpeciesFilter(btn.value)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                speciesFilter === btn.value
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {btn.icon && <btn.icon className="w-4 h-4" />}
                              {btn.label} ({btn.count})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">STATUS</p>
                        <div className="flex flex-wrap gap-2">
                          {statusButtons.map((btn) => (
                            <button
                              key={btn.value}
                              onClick={() => setStatusFilter(btn.value)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                statusFilter === btn.value
                                  ? 'bg-[var(--color-primary)] text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* View Mode */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">VIEW</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              viewMode === 'grid'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Grid className="w-4 h-4" /> Grid
                          </button>
                          <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              viewMode === 'list'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <List className="w-4 h-4" /> List
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pet Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredPets.map((pet, index) => (
                    <motion.div
                      key={pet.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <Card padding="none" className="overflow-hidden h-full flex flex-col">
                        {/* Image */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img
                            src={pet.images[0]}
                            alt={pet.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge
                              variant={
                                pet.adoptionStatus === 'available' ? 'success' :
                                pet.adoptionStatus === 'pending' ? 'warning' : 'neutral'
                              }
                            >
                              {pet.adoptionStatus}
                            </Badge>
                          </div>
                          {/* Quick Actions Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedPet(pet.id);
                                setShowAdoptConfirm(true);
                              }}
                              className="p-2.5 bg-green-500 text-white rounded-full shadow-lg"
                              title="Mark as Adopted"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </motion.button>
                            <Link to={`/shelter/edit-pet/${pet.id}`}>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2.5 bg-blue-500 text-white rounded-full shadow-lg"
                                title="Edit"
                              >
                                <Edit2 className="w-5 h-5" />
                              </motion.button>
                            </Link>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedPet(pet.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2.5 bg-red-500 text-white rounded-full shadow-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-gray-900">{pet.name}</h3>
                              <p className="text-sm text-gray-500">{pet.breed}</p>
                            </div>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                              {pet.age}
                            </span>
                          </div>

                          {/* Documentation Status */}
                          <div className="mt-2 mb-3">
                            <PetDocBadge
                              isVaccinated={pet.medical.vaccinated}
                              isMicrochipped={false} // Add to data model
                              isNeutered={pet.medical.sterilized}
                              isDewormed={pet.medical.dewormed}
                            />
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5" />
                              <span>234</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5" />
                              <span>12</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pet List View */}
            {viewMode === 'list' && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Pet Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Documentation
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Stats
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <AnimatePresence>
                        {filteredPets.map((pet, index) => (
                          <motion.tr
                            key={pet.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03 }}
                            className="group hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <img
                                  src={pet.images[0]}
                                  alt={pet.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                                <div>
                                  <div className="font-bold text-gray-900">{pet.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {pet.breed} • {pet.age}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Badge
                                variant={
                                  pet.adoptionStatus === 'available' ? 'success' :
                                  pet.adoptionStatus === 'pending' ? 'warning' : 'neutral'
                                }
                              >
                                {pet.adoptionStatus}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <PetDocBadge
                                isVaccinated={pet.medical.vaccinated}
                                isMicrochipped={false}
                                isNeutered={pet.medical.sterilized}
                                isDewormed={pet.medical.dewormed}
                                size="md"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                              <div className="flex gap-4">
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" /> 124
                                </span>
                                <span className="flex items-center gap-1">
                                  <Heart className="w-4 h-4" /> 12
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedPet(pet.id);
                                    setShowAdoptConfirm(true);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Mark Adopted"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </motion.button>
                                <Link to={`/shelter/edit-pet/${pet.id}`}>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </motion.button>
                                </Link>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    setSelectedPet(pet.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {filteredPets.length === 0 && (
                  <EmptyState
                    icon={Search}
                    title="No pets found"
                    message="Try adjusting your search or filters"
                  />
                )}
              </div>
            )}

            {/* Empty State for Grid */}
            {viewMode === 'grid' && filteredPets.length === 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-12">
                <EmptyState
                  icon={Search}
                  title="No pets found"
                  message="Try adjusting your search or filters"
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Pet?"
        message="Are you sure you want to delete this pet? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={showAdoptConfirm}
        onClose={() => setShowAdoptConfirm(false)}
        onConfirm={handleMarkAdopted}
        title="Mark as Adopted?"
        message="Congratulations! Has this pet found their forever home?"
        confirmText="Yes, Mark Adopted"
        variant="success"
      />
    </div>
  );
}