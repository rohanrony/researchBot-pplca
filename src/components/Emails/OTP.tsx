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
} from '@react-email/components';
import * as React from 'react';

interface OtpEmailProps {
  name: string;
  otpCode: string;
  type?: 'verification' | 'password_reset';
}

export const OtpEmail = ({
  name,
  otpCode,
  type = 'verification',
}: OtpEmailProps) => {
  const isVerification = type === 'verification';
  const title = isVerification ? 'Verify Your Email' : 'Reset Your Password';
  const description = isVerification
    ? 'Please verify your email address to complete your Perplexica registration.'
    : 'You requested to reset your password. Use the verification code below to continue.';

  return (
    <Html>
      <Head />
      <Preview>{title} - Perplexica</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Text style={logoText}>Perplexica</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={h1}>{title}</Heading>
            <Text style={heroText}>Hi {name},</Text>
            <Text style={heroText}>{description}</Text>
          </Section>

          <Section style={otpContainer}>
            <Text style={otpLabel}>Your verification code</Text>
            <Section style={otpBox}>
              <Text style={otpCodeText}>{otpCode}</Text>
            </Section>
            <Text style={otpExpiry}>This code will expire in 15 minutes</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={text}>
              If you didn't request this{' '}
              {isVerification ? 'verification' : 'password reset'}, you can
              safely ignore this email.
            </Text>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>Connect with us:</Text>
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
                <Link
                  href="https://instagram.com/perplexica"
                  style={socialLink}
                >
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
};

export default OtpEmail;

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
  marginBottom: '16px',
  color: '#e0e0e0',
  textAlign: 'center' as const,
};

const otpContainer = {
  textAlign: 'center' as const,
  padding: '10px 0 20px',
};

const otpLabel = {
  fontSize: '16px',
  color: '#b0b0b0',
  marginBottom: '10px',
};

const otpBox = {
  background: 'linear-gradient(145deg, #1e1e1e, #252525)',
  borderRadius: '12px',
  marginBottom: '16px',
  padding: '20px 10px',
  border: '1px solid #333',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
};

const otpCodeText = {
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '8px',
  color: '#f97316',
  margin: '0',
  textAlign: 'center' as const,
};

const otpExpiry = {
  fontSize: '14px',
  color: '#999999',
  fontStyle: 'italic',
};

const contentSection = {
  padding: '10px 0',
};

const text = {
  color: '#e0e0e0',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#333333',
  margin: '20px 0',
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
