"use client";

import { Button } from "@/components/ui/button";
import { useAirKit } from "@/contexts/airkit-context";
import { Loader2, User, LogOut } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ConnectButton() {
  const { user, isAuthenticated, isLoading, login, logout } = useAirKit();
  const [showSimpleDisconnect, setShowSimpleDisconnect] = useState(false);

  const handleConnect = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Disconnection failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (isAuthenticated && user) {
    const displayName = user.uuid?.slice(0, 8) || user.id?.slice(0, 8) || 'User';

    // Fallback: Simple disconnect button if dropdown isn't working
    if (showSimpleDisconnect) {
      return (
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <User className="mr-2 h-4 w-4" />
            {displayName}...
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDisconnect}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </Button>
        </div>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <User className="mr-2 h-4 w-4" />
            {displayName}...
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled className="cursor-default">
            <User className="mr-2 h-4 w-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Connected</span>
              <span className="text-xs text-muted-foreground truncate">
                {user.uuid || user.id}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDisconnect}
            className="text-red-600 focus:text-red-600 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowSimpleDisconnect(true)}
            className="text-xs text-muted-foreground cursor-pointer"
          >
            Use simple disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={handleConnect}>
      Connect Moca ID
    </Button>
  );
}