import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowUpCircle, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface TransactionListProps {
  transactions: any[];
  onAccountFilter: (accountId: string | null) => void;
}

export function TransactionList({ transactions, onAccountFilter }: TransactionListProps) {
  const [search, setSearch] = useState("");

  const filteredTransactions = transactions.filter((t) =>
    t.descricao.toLowerCase().includes(search.toLowerCase()) ||
    t.documento?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou documento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Data</th>
                <th className="text-left p-4">Conta</th>
                <th className="text-left p-4">Descrição</th>
                <th className="text-left p-4">Documento</th>
                <th className="text-right p-4">Valor</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    {new Date(transaction.data_transacao).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="p-4 text-sm">
                    {transaction.bank_account?.nome_conta}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {transaction.tipo_transacao === 'credito' ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="max-w-md truncate">{transaction.descricao}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {transaction.documento || "-"}
                  </td>
                  <td className="p-4 text-right font-mono">
                    <span className={transaction.tipo_transacao === 'credito' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.tipo_transacao === 'credito' ? '+' : '-'}
                      {Number(transaction.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                  <td className="p-4">
                    {transaction.conciliado ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Conciliado
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Pendente</Badge>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!transaction.conciliado && (
                      <Button size="sm" variant="outline">
                        Conciliar
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
