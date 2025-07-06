
import React from 'react';

interface Quote {
  quote_text: string;
  author_name: string;
  author_role?: string;
}

interface TrackQuotesProps {
  quotes: Quote[];
}

const TrackQuotes: React.FC<TrackQuotesProps> = ({ quotes }) => {
  if (!quotes || quotes.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-muted/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Testimonios</h2>
        <div className="grid gap-8">
          {quotes.map((quote, index) => (
            <blockquote key={index} className="bg-card p-8 rounded-lg shadow-lg">
              <p className="text-lg italic mb-4">"{quote.quote_text}"</p>
              <footer className="text-right">
                <cite className="font-semibold">{quote.author_name}</cite>
                {quote.author_role && (
                  <span className="text-muted-foreground block">{quote.author_role}</span>
                )}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrackQuotes;
