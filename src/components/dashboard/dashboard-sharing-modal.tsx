"use client";

import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useFindUniqueDashboard, useUpdateDashboard, useFindManyUser } from "@/lib/zenstack-hooks";
import LoadingSpinner from "@/components/loading-spinner";
import { Copy, X } from "lucide-react";
import { useToast } from "@/lib/hooks/toast";

interface DashboardSharingModalProps {
  dashboardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSharingModal({ 
  dashboardId, 
  isOpen, 
  onClose 
}: DashboardSharingModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const { data: dashboard, isLoading: isDashboardLoading } = useFindUniqueDashboard({
    where: { id: dashboardId },
    include: { sharedWith: true }
  }, {
    enabled: isOpen
  });
  
  const { data: users, isLoading: isUsersLoading } = useFindManyUser({
    where: {
      id: { not: dashboard?.ownerId },
      OR: [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { email: { contains: searchQuery, mode: "insensitive" } }
      ]
    }
  }, {
    enabled: isOpen && searchQuery.length > 2
  });
  
  const { mutate: updateDashboard } = useUpdateDashboard();
  
  useEffect(() => {
    if (dashboard) {
      setIsPublic(dashboard.isPublic);
      setSelectedUsers(dashboard.sharedWith.map(user => user.id));
    }
  }, [dashboard]);
  
  const handleSave = () => {
    if (!dashboard) return;
    
    setIsSubmitting(true);
    updateDashboard({
      where: { id: dashboardId },
      data: {
        isPublic,
        sharedWith: {
          set: selectedUsers.map(id => ({ id }))
        }
      }
    }, {
      onSuccess: () => {
        setIsSubmitting(false);
        onClose();
      },
      onError: (error) => {
        console.error("Erro ao atualizar configurações de compartilhamento:", error);
        setIsSubmitting(false);
        toast.exception(error);
      }
    });
  };
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const handleCopyLink = async () => {
    const url = `${window.location.origin}/dashboard/${dashboardId}`;
    await navigator.clipboard.writeText(url);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartilhar Dashboard</DialogTitle>
          <DialogDescription>
            Gerencie as configurações de compartilhamento do seu dashboard
          </DialogDescription>
        </DialogHeader>
        
        {isDashboardLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="public">Dashboard Público</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
              
              {isPublic && (
                <div className="flex space-x-2">
                  <Input 
                    value={`${window.location.origin}/dashboard/${dashboardId}`} 
                    readOnly
                    className="flex-1"
                  />
                  <Button size="icon" onClick={handleCopyLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>Compartilhe com usuários específicos</Label>
                <Input
                  placeholder="Busque por nome ou email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                {searchQuery.length > 2 && users && users.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {users.map(user => (
                      <div 
                        key={user.id} 
                        className={`flex items-center justify-between p-2 hover:bg-muted cursor-pointer ${
                          selectedUsers.includes(user.id) ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div>
                          <p className="font-medium">{user.name || 'Usuário sem nome'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div>
                          {selectedUsers.includes(user.id) && (
                            <div className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery.length > 2 && users && users.length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
                )}
                
                {selectedUsers.length > 0 && (
                  <div className="mt-4">
                    <Label>Compartilhado com</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedUsers.map(userId => {
                        const user = dashboard?.sharedWith.find(u => u.id === userId);
                        return user && (
                          <div 
                            key={userId}
                            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                          >
                            {user.name || user.email}
                            <button 
                              onClick={() => toggleUserSelection(userId)}
                              className="text-secondary-foreground/70 hover:text-secondary-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
              Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
