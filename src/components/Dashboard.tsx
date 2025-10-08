import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { TransactionList } from "./TransactionList";
import { FinanceChart } from "./FinanceChart";
import { AddTransactionDialog } from "./AddTransactionDialog";
import { ProjectsList, Project } from "./ProjectsList";
import { AddProjectDialog } from "./AddProjectDialog";
import { useState } from "react";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: Date;
}

export const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 5000,
      category: "Salary",
      description: "Monthly salary",
      date: new Date(2025, 9, 1),
    },
    {
      id: "2",
      type: "expense",
      amount: 1200,
      category: "Rent",
      description: "Office rent",
      date: new Date(2025, 9, 5),
    },
    {
      id: "3",
      type: "expense",
      amount: 350,
      category: "Utilities",
      description: "Internet & electricity",
      date: new Date(2025, 9, 10),
    },
    {
      id: "4",
      type: "income",
      amount: 2500,
      category: "Freelance",
      description: "Client project",
      date: new Date(2025, 9, 15),
    },
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Website Redesign",
      description: "Complete redesign of company website",
      price: 5000,
      date: new Date(2025, 9, 1),
      isDone: true,
      isPaid: true,
    },
    {
      id: "2",
      name: "Mobile App Development",
      description: "iOS and Android app for client",
      price: 12000,
      date: new Date(2025, 9, 15),
      isDone: false,
      isPaid: false,
    },
  ]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const handleAddTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleAddProject = (project: Omit<Project, "id">) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects([newProject, ...projects]);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">FinanceTrack</h1>
              <p className="text-sm text-muted-foreground">Business Finance Manager</p>
            </div>
          </div>
          <div className="flex gap-2">
            <AddTransactionDialog onAdd={handleAddTransaction} />
            <AddProjectDialog onAdd={handleAddProject} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="p-6 bg-gradient-card border-border shadow-elevation hover:shadow-glow transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                <p className="text-3xl font-bold text-success mt-2">
                  ${totalIncome.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border shadow-elevation hover:shadow-glow transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-3xl font-bold text-destructive mt-2">
                  ${totalExpenses.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card border-border shadow-elevation hover:shadow-glow transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                <p className={`text-3xl font-bold mt-2 ${netBalance >= 0 ? "text-success" : "text-destructive"}`}>
                  ${netBalance.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <FinanceChart transactions={transactions} />
        </div>

        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-6">
            <TransactionList transactions={transactions} />
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            <ProjectsList projects={projects} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
