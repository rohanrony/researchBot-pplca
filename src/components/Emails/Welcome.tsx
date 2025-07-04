import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Row,
  Column,
  Hr,
  Img,
} from '@react-email/components';
import * as React from 'react';

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Perplexica!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoContainer}>
          <Text style={logoText}>Perplexica</Text>
        </Section>

        <Section style={heroSection}>
          <Heading style={h1}>Welcome to Perplexica, {name}!</Heading>
          <Text style={heroText}>
            We're thrilled to have you on board! Perplexica is your new
            destination for unlimited learning and discovery. We're excited to
            help you start your journey.
          </Text>
        </Section>

        <Section style={contentSection}>
          <Text style={text}>
            Here's what you can do with your new account:
          </Text>
          <Section style={featureBox}>
            <Text style={featureText}>
              🚀 Explore personalized learning paths
            </Text>
          </Section>
          <Section style={featureBox}>
            <Text style={featureText}>
              🧠 Access thousands of interactive challenges
            </Text>
          </Section>
          <Section style={featureBox}>
            <Text style={featureText}>
              🏆 Track your progress and earn achievements
            </Text>
          </Section>
        </Section>

        <Section style={ctaSection}>
          <Link style={button} href="https://perplexica.app/dashboard">
            Start Exploring
          </Link>
        </Section>

        <Hr style={divider} />

        <Section style={footerSection}>
          <Text style={footerText}>
            Follow us on social media for the latest updates:
          </Text>
          <Row>
            <Column style={socialColumn}>
              <Link href="https://youtube.com/perplexica" style={socialLink}>
                📺 YouTube
              </Link>
            </Column>
            <Column style={socialColumn}>
              <Link href="https://twitter.com/perplexica" style={socialLink}>
                🐦 Twitter
              </Link>
            </Column>
            <Column style={socialColumn}>
              <Link href="https://facebook.com/perplexica" style={socialLink}>
                👍 Facebook
              </Link>
            </Column>
            <Column style={socialColumn}>
              <Link href="https://instagram.com/perplexica" style={socialLink}>
                📸 Instagram
              </Link>
            </Column>
          </Row>
          <Text style={copyrightText}>
            © {new Date().getFullYear()} Perplexica. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#121212',
  color: '#ffffff',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
};

const logoContainer = {
  marginTop: '20px',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const logoText = {
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: '#f97316',
  margin: '0',
};

const heroSection = {
  padding: '20px 0',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '700',
  margin: '10px 0',
  padding: '0',
  lineHeight: '36px',
  textAlign: 'center' as const,
};

const heroText = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
  color: '#e0e0e0',
  textAlign: 'center' as const,
};

const contentSection = {
  padding: '10px 0',
};

const featureBox = {
  background: '#1e1e1e',
  borderRadius: '8px',
  marginBottom: '12px',
  padding: '15px',
  borderLeft: '4px solid #f97316',
};

const featureText = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  color: '#e0e0e0',
};

const ctaSection = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#f97316',
  borderRadius: '6px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#333333',
  margin: '20px 0',
};

const text = {
  color: '#e0e0e0',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
};

const footerSection = {
  padding: '10px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#b0b0b0',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '16px',
};

const socialColumn = {
  paddingRight: '8px',
  paddingLeft: '8px',
};

const socialLink = {
  color: '#b0b0b0',
  textDecoration: 'none',
  fontSize: '14px',
};

const copyrightText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '20px',
};
