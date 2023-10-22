import {
  Body,
  Button,
  Container,
  Column,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
  Head,
  Img,
} from "@react-email/components";
import { env } from "~/env.mjs";
import { primaryColour, secondaryColour } from "~/utils/constants";

export const accountVerificationPlainText = (name: string, token: string) => {
  return `
    Hello ${name}!
    
    Please click the link below to verify your account and complete
    your signup process.
  
    Verify Your Account [${env.NEXT_PUBLIC_DOMAIN}/account-verification/${token}]
  
    Bella © 2023
    `;
};

interface AccountVerificationProps {
  name: string;
  token: string;
}

const AccountVerification: React.FC<AccountVerificationProps> = ({
  name,
  token,
}) => {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>{`Bella - ${name}'s Account Verification`}</Preview>
        <Body
          style={{ backgroundColor: primaryColour }}
          className="m-auto py-10"
        >
          <Container className="w-11/12 rounded-md border border-solid border-gray-300 px-4 pt-6">
            <Section>
              <Row className="mb-4 border-b border-solid border-gray-300 pb-4">
                <Column align="left">
                  <Img
                    src={`${env.NEXT_PUBLIC_DOMAIN}/media/utils/bella-logo.png`}
                    alt="Bella"
                    className="w-1/2"
                  />
                </Column>
              </Row>
            </Section>
            <Section className="mb-6 h-full text-base sm:text-lg">
              <Text
                style={{ color: secondaryColour }}
                className="text-xl font-semibold sm:text-2xl"
              >
                {`Hello ${name}!`}
              </Text>
              <Text style={{ color: secondaryColour }} className="mb-6">
                Please click the link below to verify your account and complete
                your signup process.
              </Text>
              <Row>
                <Column align="center">
                  <Button
                    style={{
                      backgroundColor: secondaryColour,
                      color: primaryColour,
                    }}
                    className="rounded-md p-4 font-semibold"
                    href={`${env.NEXT_PUBLIC_DOMAIN}/account-verification/${token}`}
                  >
                    Verify Your Account
                  </Button>
                </Column>
              </Row>
            </Section>
            <Row>
              <Column align="right">
                <Text
                  style={{ color: secondaryColour }}
                  className="text-xs text-gray-400 sm:text-sm"
                >
                  Bella &copy; 2023
                </Text>
              </Column>
            </Row>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
};

export default AccountVerification;
