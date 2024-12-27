"use client"

import { Card, CardContent, CardFooter } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";
import { Social } from "./social";




interface CardWrapperProps {
    children: React.ReactNode;
    headerLabel: string;
    backButtonLabel: string;
    backButtonHref: string;
    showSocial?: boolean;

}

export const CardWrapper = ({
    children,
    headerLabel,
    backButtonLabel,
    backButtonHref,
    showSocial


}: CardWrapperProps) => {
    return (
        <Card className="w-[400px] shadow-md">
            <Header label={headerLabel} />
            <CardContent>
            {children}
            </CardContent>
            {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      <CardFooter>
        <BackButton
        label={backButtonLabel}
        href={backButtonHref} />
      </CardFooter>

        </Card>
    )

}