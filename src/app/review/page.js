import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Review Dreamline Production on Google',
    description: 'Share your experience with Dreamline Production on Google Maps.',
    robots: {
        index: false,
        follow: false,
    },
};

const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJj45i25BwAjoRO1La59wUhTs";

export default function ReviewRedirectPage() {
    redirect(GOOGLE_REVIEW_URL);
}
