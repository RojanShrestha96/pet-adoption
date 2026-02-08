import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPinIcon,
  PhoneIcon,
  MailIcon,
  ClockIcon,
  HeartIcon,
  UsersIcon,
  PawPrintIcon,
  CalendarIcon,
  MessageSquareIcon,
  StarIcon,
  ChevronRightIcon,
  DogIcon,
  CatIcon,
  LayoutGridIcon,
} from "lucide-react";
import { Navbar } from "../../components/layout/Navbar";
import { Footer } from "../../components/layout/Footer";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { ShelterMap } from "../../components/shelters/ShelterMap";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

export function ShelterProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<"all" | "dogs" | "cats" | "other">(
    "all"
  );
  const [shelter, setShelter] = useState<any>(null);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShelterAndPets = async () => {
      try {
        setLoading(true);
        const [shelterRes, petsRes] = await Promise.all([
          fetch(`http://localhost:5000/api/shelter/${id}`),
          fetch(`http://localhost:5000/api/pets?shelter=${id}&status=available`)
        ]);

        if (shelterRes.ok) {
          const shelterData = await shelterRes.json();
          setShelter(shelterData);
        }

        if (petsRes.ok) {
          const petsData = await petsRes.json();
          // Backend returns { pets, total, page, totalPages }
          setPets(petsData.pets || []);
        }
      } catch (error) {
        console.error("Failed to fetch shelter or pets", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShelterAndPets();
  }, [id]);

  // Use real pets fetched from the backend
  const shelterPets = pets;

  // Filter pets by type
  const filteredPets =
    activeTab === "all"
      ? shelterPets
      : shelterPets.filter((pet) => {
          if (activeTab === "dogs")
            return (pet.species as string).toLowerCase() === "dog";
          if (activeTab === "cats")
            return (pet.species as string).toLowerCase() === "cat";
          return (
            (pet.species as string).toLowerCase() !== "dog" &&
            (pet.species as string).toLowerCase() !== "cat"
          );
        });

  // Helper to format time to 12-hour AM/PM
  const formatTime = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const m = parseInt(minutes, 10);
    if (isNaN(h) || isNaN(m)) return time;
    const ampm = h >= 12 ? "PM" : "AM";
    const formattedHour = h % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!shelter) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex flex-col items-center justify-center gap-4">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Shelter not found
        </h2>
        <Link to="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </div>
    );
  }

  const stats = [
    {
      label: "Pets Available",
      value: shelter.stats?.totalPets || 12,
      icon: <PawPrintIcon className="w-5 h-5" />,
    },
    {
      label: "Pets Adopted",
      value: shelter.stats?.adoptions || 85,
      icon: <HeartIcon className="w-5 h-5" />,
    },
    { label: "Volunteers", value: 24, icon: <UsersIcon className="w-5 h-5" /> }, // Mock for now
    {
      label: "Rating",
      value: shelter.rating || "New",
      icon: <StarIcon className="w-5 h-5" />,
    },
  ];

  // Simplify address display: preferably City, State or first 3 parts of long address
  const getDisplayAddress = () => {
    if (shelter.city) {
      // ideally: "Street, City" if available and not too long
      // But if address is super long, ignore it or truncate it
      if (shelter.address && shelter.address.length < 50) {
        return `${shelter.address}, ${shelter.city}`;
      }
      return `${shelter.city}, ${shelter.state || "Nepal"}`;
    }

    // Fallback to formatted address but truncated
    if (shelter.location?.formattedAddress) {
      const parts = shelter.location.formattedAddress.split(",");
      // Heuristic: Take only the first 3 parts to avoid the full geopolitical hierarchy
      return parts.slice(0, 3).join(", ");
    }

    return shelter.address || "Location hidden";
  };

  const displayAddress = getDisplayAddress();

  return (
    <div className="min-h-screen bg-[var(--color-background)] transition-colors duration-300">
      <Navbar />

      <main className="pt-20 pb-16">
        {/* Hero Banner */}
        <div className="relative h-48 md:h-64 lg:h-80 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={
                shelter.coverImage ||
                "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=400&fit=crop"
              }
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {/* Overlay for text readability if needed, though header card pops out */}
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 h-24"
            style={{
              background:
                "linear-gradient(to top, var(--color-background), transparent)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Shelter Header Card */}
            <motion.div variants={itemVariants}>
              <Card className="p-6 md:p-8 mb-8 border border-[var(--color-border)]">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Shelter Image */}
                  <div className="flex-shrink-0">
                    {shelter.logo ? (
                      <img
                        src={shelter.logo}
                        alt={shelter.name}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover shadow-lg mx-auto lg:mx-0 border-4 border-white"
                      />
                    ) : (
                      <div
                        className="w-32 h-32 md:w-40 md:h-40 rounded-2xl flex items-center justify-center shadow-lg mx-auto lg:mx-0 border-4 border-white"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                        }}
                      >
                        <span className="text-4xl md:text-5xl font-bold text-white tracking-widest">
                          {shelter.name
                            .split(" ")
                            .map((word: any) => word[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shelter Info */}
                  <div className="flex-1 text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div>
                        <h1
                          className="text-2xl md:text-3xl font-bold mb-2"
                          style={{ color: "var(--color-text)" }}
                        >
                          {shelter.name}
                        </h1>
                        <div
                          className="flex items-center justify-center lg:justify-start gap-2 mb-4"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          <MapPinIcon className="w-4 h-4 text-[var(--color-primary)]" />
                          <span>{displayAddress}</span>
                        </div>

                        {/* Contact Info */}
                        <div
                          className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          {shelter.phone && (
                            <div className="flex items-center gap-1">
                              <PhoneIcon className="w-4 h-4 text-[var(--color-primary)]" />
                              <span>{shelter.phone}</span>
                            </div>
                          )}
                          {shelter.email && (
                            <div className="flex items-center gap-1">
                              <MailIcon className="w-4 h-4 text-[var(--color-primary)]" />
                              <span>{shelter.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)]">
                            {
                              /* Quick Status: Open/Closed */
                              (() => {
                                if (
                                  !shelter.operatingHours ||
                                  typeof shelter.operatingHours === "string"
                                )
                                  return (
                                    <span className="text-gray-500">
                                      Hours N/A
                                    </span>
                                  );
                                const days = [
                                  "sunday",
                                  "monday",
                                  "tuesday",
                                  "wednesday",
                                  "thursday",
                                  "friday",
                                  "saturday",
                                ];
                                const today = days[new Date().getDay()];
                                const status = shelter.operatingHours[today];

                                if (!status || status.closed) {
                                  return (
                                    <>
                                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                      <span className="font-medium text-red-600">
                                        Closed Today
                                      </span>
                                    </>
                                  );
                                }
                                return (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-medium text-green-700">
                                      Open Today: {formatTime(status.open)} -{" "}
                                      {formatTime(status.close)}
                                    </span>
                                  </>
                                );
                              })()
                            }
                          </div>
                        </div>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                        <Button
                          variant="primary"
                          className="flex items-center justify-center gap-2 w-full sm:w-auto"
                          onClick={async () => {
                            // Check if user is logged in (roughly check token)
                            const token = localStorage.getItem("token");
                            if (!token) {
                              window.location.href = "/login";
                              return;
                            }

                            try {
                              const res = await fetch(
                                "http://localhost:5000/api/messages",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`,
                                  },
                                  body: JSON.stringify({
                                    recipientId: shelter._id || shelter.id,
                                  }),
                                }
                              );

                              if (res.ok) {
                                const conversation = await res.json();
                                // Redirect to messages page with this conversation selected
                                // Using window.location for full refresh or we can use useNavigate if we convert component
                                // Since we are outside Router context here? No, ShelterProfilePage is inside Router.
                                // But I don't have useNavigate hook here yet. Let's add it.
                                window.location.href = `/messages?conversationId=${conversation._id}`;
                              } else {
                                alert("Failed to start conversation");
                              }
                            } catch (err) {
                              console.error(err);
                              if (shelter.email)
                                window.location.href = `mailto:${shelter.email}`;
                            }
                          }}
                        >
                          <MessageSquareIcon className="w-4 h-4" />
                          Message Shelter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  className="p-4 md:p-6 text-center border border-[var(--color-border)]"
                >
                  <div
                    className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className="text-2xl md:text-3xl font-bold mb-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm"
                    style={{ color: "var(--color-text-light)" }}
                  >
                    {stat.label}
                  </div>
                </Card>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 md:p-8 border border-[var(--color-border)]">
                    <h2
                      className="text-xl font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      <HeartIcon className="w-5 h-5 text-[var(--color-primary)]" />
                      About Us
                    </h2>
                    <p
                      className="leading-relaxed mb-6"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {shelter.description ||
                        `${shelter.name} is dedicated to rescuing and rehoming animals in need. Our mission is to provide a safe haven for abandoned and surrendered pets while finding them loving forever homes.`}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--color-surface)" }}
                        >
                          <CalendarIcon className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <div
                            className="font-medium"
                            style={{ color: "var(--color-text)" }}
                          >
                            Established
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            {shelter.establishedDate
                              ? new Date(shelter.establishedDate).getFullYear()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--color-surface)" }}
                        >
                          <PawPrintIcon className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <div
                            className="font-medium"
                            style={{ color: "var(--color-text)" }}
                          >
                            Animals Supported
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: "var(--color-text-light)" }}
                          >
                            Dogs, Cats, Small Pets
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Available Pets Section */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 md:p-8 border border-[var(--color-border)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h2
                        className="text-xl font-bold flex items-center gap-2"
                        style={{ color: "var(--color-text)" }}
                      >
                        <PawPrintIcon className="w-5 h-5 text-[var(--color-primary)]" />
                        Available Pets
                      </h2>

                      {/* Filter Tabs */}
                      <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                        {(
                          [
                            { id: "all", label: "All", icon: LayoutGridIcon },
                            { id: "dogs", label: "Dogs", icon: DogIcon },
                            { id: "cats", label: "Cats", icon: CatIcon },
                            { id: "other", label: "Others", icon: PawPrintIcon },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2"
                            style={{
                              background:
                                activeTab === tab.id
                                  ? "var(--color-primary)"
                                  : "var(--color-surface)",
                              color:
                                activeTab === tab.id
                                  ? "white"
                                  : "var(--color-text-light)",
                            }}
                          >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Pets Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredPets.length > 0 ? (
                        filteredPets.slice(0, 4).map((pet, index) => (
                          <motion.div
                            key={pet.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link to={`/pet/${pet.id}`}>
                              <div className="group rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-[var(--color-surface)]">
                                <div className="aspect-[4/3] relative overflow-hidden">
                                  <img
                                    src={pet.images[0]}
                                    alt={pet.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-3 right-3">
                                    <Badge
                                      variant={
                                        pet.adoptionStatus === "available"
                                          ? "success"
                                          : pet.adoptionStatus === "pending"
                                          ? "warning"
                                          : "neutral"
                                      }
                                    >
                                      {pet.adoptionStatus}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3
                                    className="font-semibold group-hover:text-[var(--color-primary)] transition-colors"
                                    style={{ color: "var(--color-text)" }}
                                  >
                                    {pet.name}
                                  </h3>
                                  <p
                                    className="text-sm"
                                    style={{ color: "var(--color-text-light)" }}
                                  >
                                    {pet.breed} • {pet.age}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))
                      ) : (
                        <div
                          className="col-span-full text-center py-12"
                          style={{ color: "var(--color-text-light)" }}
                        >
                          No pets available in this category
                        </div>
                      )}
                    </div>

                    {filteredPets.length > 4 && (
                      <div className="mt-6 text-center">
                        <Link to={`/search?shelter=${shelter.id}`}>
                          <Button
                            variant="secondary"
                            className="inline-flex items-center gap-2"
                          >
                            View All Pets
                            <ChevronRightIcon className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Map Section */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 overflow-hidden border border-[var(--color-border)]">
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      <MapPinIcon className="w-5 h-5 text-[var(--color-primary)]" />
                      Location
                    </h3>

                    {/* Real Map using ShelterMap component */}
                    <div className="h-64 rounded-xl overflow-hidden mb-4 border border-[var(--color-border)] relative z-0">
                      {shelter.location?.lat && shelter.location?.lng ? (
                        <ShelterMap
                          lat={shelter.location.lat}
                          lng={shelter.location.lng}
                          name={shelter.name}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-text-light)]">
                          Map not available
                        </div>
                      )}
                    </div>

                    <p
                      className="text-sm mb-4"
                      style={{ color: "var(--color-text-light)" }}
                    >
                      {displayAddress}
                    </p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${shelter.location?.lat},${shelter.location?.lng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-1"
                      >
                        <MapPinIcon className="w-4 h-4" />
                        Open in Google Maps
                      </Button>
                    </a>
                  </Card>
                </motion.div>

                {/* Operating Hours */}
                <motion.div variants={itemVariants}>
                  <Card className="p-6 border border-[var(--color-border)]">
                    <h3
                      className="font-bold mb-4 flex items-center gap-2"
                      style={{ color: "var(--color-text)" }}
                    >
                      <ClockIcon className="w-5 h-5 text-[var(--color-primary)]" />
                      Operating Hours
                    </h3>
                    <div className="space-y-1 text-sm bg-[var(--color-surface)] p-2 rounded-xl">
                      {[
                        "monday",
                        "tuesday",
                        "wednesday",
                        "thursday",
                        "friday",
                        "saturday",
                        "sunday",
                      ].map((day) => {
                        const schedule = shelter.operatingHours?.[day];
                        const isToday =
                          [
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                          ][new Date().getDay()] === day;

                        return (
                          <div
                            key={day}
                            className={`flex justify-between items-center p-2 rounded-lg transition-colors ${
                              isToday
                                ? "bg-[var(--color-primary)]/10 font-semibold"
                                : ""
                            }`}
                          >
                            <span
                              className="capitalize"
                              style={{
                                color: isToday
                                  ? "var(--color-primary)"
                                  : "var(--color-text-light)",
                              }}
                            >
                              {day} {isToday && "(Today)"}
                            </span>
                            <span
                              className={
                                !schedule || schedule.closed
                                  ? "text-red-500"
                                  : ""
                              }
                              style={{
                                color:
                                  !schedule || schedule.closed
                                    ? undefined
                                    : "var(--color-text)",
                              }}
                            >
                              {schedule && !schedule.closed ? (
                                `${formatTime(schedule.open)} - ${formatTime(
                                  schedule.close
                                )}`
                              ) : (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                                  Closed
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>

                {/* Quick Contact */}
                <motion.div variants={itemVariants}>
                  <Card
                    className="p-6 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
                    }}
                  >
                    <h3 className="font-bold mb-2">Ready to Adopt?</h3>
                    <p className="text-sm text-white/90 mb-4">
                      Contact us today to schedule a visit and meet your new
                      best friend!
                    </p>
                    <Button
                      variant="secondary"
                      className="w-full bg-white hover:bg-gray-100 border-none text-[var(--color-primary)]"
                      onClick={() => {
                        window.location.href = `mailto:${shelter.email}`;
                      }}
                    >
                      Schedule a Visit
                    </Button>
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}



