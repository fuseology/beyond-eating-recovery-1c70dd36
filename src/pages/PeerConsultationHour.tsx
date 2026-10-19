import { Helmet } from "react-helmet";
import Header from "@/components/Header";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users } from "lucide-react";

const PAGE_URL = "https://www.beyondeatingrecovery.com/peer-consultation-hour";
const TITLE = "Peer Consultation Hour for Therapists | Beyond Eating Recovery";
const DESCRIPTION =
  "Free monthly virtual peer consultation for generalist therapists on eating disorders, disordered eating, and weight-inclusive HAES® care. Next: Jan 20, 2027.";
const INTRO =
  "We're organizing a free, monthly virtual peer consultation hour starting this January for clinicians interested in discussing eating disorders, disordered eating, and applying Weight-Inclusive / HAES® frameworks in outpatient therapy.";

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Peer Consultation Hour for Therapists",
  startDate: "2027-01-20T12:00:00-08:00",
  endDate: "2027-01-20T13:00:00-08:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
  location: { "@type": "VirtualLocation", url: PAGE_URL },
  organizer: { "@type": "Organization", name: "Beyond Eating Recovery", url: "https://www.beyondeatingrecovery.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock", url: PAGE_URL },
  description: INTRO,
};

const formatItems = [
  { time: "20 Mins", text: "Quick case breakdown & resource share (Topic for Jan: Navigating HAES® & Weight Stigma in Outpatient Practice)" },
  { time: "35 Mins", text: "Open peer case consultation & group discussion" },
  { time: "5 Mins", text: "Resource wrap-up & PDF takeaway" },
];

const details = [
  { icon: Calendar, label: "When", text: "3rd Wednesday of the Month. January 20, 2027 at 12:00 PM to 1:00 PM PST" },
  { icon: MapPin, label: "Where", text: "Virtual via Google Meet" },
  { icon: DollarSign, label: "Cost", text: "Free" },
  { icon: Users, label: "Who it's for", text: "Generalist therapists and private practitioners" },
];

const PeerConsultationHour = () => {
  const scrollToSignUp = () => {
    document.getElementById("sign-up")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(eventSchema)}</script>
      </Helmet>
      <BreadcrumbSchema />
      <Header />
      <Breadcrumbs />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-accent/60" />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center text-white">
          <Badge variant="secondary" className="mb-4 bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
            <Calendar className="w-4 h-4 mr-1" />
            Next session: January 20, 2027 | 12:00 PM to 1:00 PM PST
          </Badge>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Peer Consultation Hour for Therapists
          </h1>
          <p className="text-2xl md:text-3xl mb-10 max-w-3xl mx-auto text-white/95">
            A free, monthly virtual peer consultation hour for clinicians
          </p>
          <Button size="lg" onClick={scrollToSignUp} className="bg-accent hover:bg-accent/90 text-white text-xl px-10 py-7 shadow-xl">
            Save Your Spot
          </Button>
        </div>
      </section>

      {/* About the Group */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl font-bold mb-8 text-primary">About the Group</h2>
            <p className="text-xl text-foreground/80 leading-relaxed">{INTRO}</p>
            <p className="text-xl text-foreground/80 leading-relaxed">
              This group is specifically designed for generalist therapists and private practitioners who don't specialize in eating disorders, but frequently encounter client disclosures around food, body image, weight, and dieting.
            </p>
            <p className="text-xl text-foreground/80 leading-relaxed">
              This group provides a welcoming, low-pressure space to talk shop, ask questions, share resources, and consult on real-world cases.
            </p>
          </div>
        </div>
      </section>

      {/* Session Format */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">Session Format</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {formatItems.map((item) => (
              <Card key={item.time} className="border-2">
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-accent mb-3">{item.time}</p>
                  <p className="text-lg text-foreground/80">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-primary">Details</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
            {details.map((d) => (
              <Card key={d.label} className="border-2">
                <CardContent className="flex items-start gap-4 pt-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <d.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-1">{d.label}</h3>
                    <p className="text-lg text-foreground/80">{d.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="max-w-4xl mx-auto mt-10 text-center text-lg text-foreground/80 leading-relaxed">
            A 1-page clinical cheat sheet comparing weight-centric vs. weight-inclusive interventions will be shared with all attendees for quick reference in practice.
          </p>
        </div>
      </section>

      {/* Sign Up */}
      <section id="sign-up" className="py-20 bg-secondary/30 scroll-mt-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-6 text-primary">Save Your Spot</h2>
          <p className="text-xl text-center text-foreground/80 mb-10">
            If you'd like to save your spot for January's consultation hour, sign up below.
          </p>
          <div className="max-w-[640px] mx-auto w-full">
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeZIuzlPkJEx3IjTpVuQUiU7ZrcwPN9kFSjYBvjBSsHcEC7Hg/viewform?embedded=true"
              width="100%"
              height="1509"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Peer Consultation Hour sign-up form"
              loading="lazy"
              className="w-full border-0"
            >
              Loading...
            </iframe>
          </div>
          <p className="text-center text-foreground/80 mt-6">
            Form not loading?{" "}
            <a href="https://forms.gle/YCs6ryrZ84M6FLng7" target="_blank" rel="noopener noreferrer" className="text-accent underline hover:text-accent/80">
              Open the sign-up form in a new tab
            </a>
            .
          </p>
          <p className="text-center text-xl text-primary font-semibold mt-12">
            Looking forward to connecting with fellow PNW clinicians!
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PeerConsultationHour;
