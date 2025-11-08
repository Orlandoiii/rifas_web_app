import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package } from 'lucide-react';
import NavBar from '../components/site/NavBar';
import Footer from '../components/site/Footer';
import PurchaseCard from '../components/site/PurchaseCard';
import PurchaseSuccessView, { type PurchaseSuccessData } from '../components/site/PurchaseSuccessView';
import VerifyRaffleForm from '../components/site/VerifyRaffleForm';
import Modal from '../components/lib/components/modal/core/Modal';
import { usePurchases } from '../hooks';
import { Loader } from '../components/lib/components/loader';

export default function MyPurchases() {
  const { purchases, isLoading } = usePurchases();
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseSuccessData | null>(null);
  const [verifyingPurchase, setVerifyingPurchase] = useState<PurchaseSuccessData | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <NavBar />
      
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-mint-main/10 rounded-xl">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-mint-main" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary">
                Mis Compras
              </h1>
              <p className="text-sm sm:text-base text-text-secondary mt-1">
                Historial de tus participaciones en rifas
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="bg-bg-secondary border border-border-light rounded-xl p-4">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Total de Compras</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary">
                {purchases.length}
              </p>
            </div>
            <div className="bg-bg-secondary border border-border-light rounded-xl p-4">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Tickets Totales</p>
              <p className="text-xl sm:text-2xl font-bold text-binance-main">
                {purchases.reduce((acc, p) => acc + p.tickets.length, 0)}
              </p>
            </div>
            <div className="bg-bg-secondary border border-border-light rounded-xl p-4 col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-text-muted mb-1">Monto Total</p>
              <p className="text-xl sm:text-2xl font-bold text-mint-main">
                {new Intl.NumberFormat('es-VE', {
                  style: 'currency',
                  currency: purchases[0]?.currency || 'USD',
                  minimumFractionDigits: 2,
                }).format(purchases.reduce((acc, p) => acc + p.amount, 0))}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de compras */}
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24">
            <div className="p-6 bg-bg-secondary rounded-full mb-6">
              <Package className="w-12 h-12 sm:w-16 sm:h-16 text-text-muted" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-2">
              No hay compras aún
            </h2>
            <p className="text-sm sm:text-base text-text-secondary text-center max-w-md mb-6">
              Cuando realices tu primera compra, aparecerá aquí para que puedas consultarla en cualquier momento.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-binance-main hover:bg-binance-dark text-white font-semibold rounded-lg transition-colors"
            >
              Ver Rifas Disponibles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {purchases.map((purchase) => (
              <PurchaseCard
                key={purchase.transactionId}
                purchase={purchase}
                onViewDetails={() => setSelectedPurchase(purchase)}
                onVerify={() => setVerifyingPurchase(purchase)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Modal de detalle */}
      <PurchaseSuccessView
        data={selectedPurchase}
        open={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
      />

      {/* Modal de verificación */}
      {verifyingPurchase && (
        <Modal
          open={!!verifyingPurchase}
          onClose={() => {
            setVerifyingPurchase(null);
          }}
          size="xl"
          title={`Verificar: ${verifyingPurchase.raffle.title}`}
          lockBodyScroll
          closeOnBackdropClick={false}
        >
          <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden w-full">
            <VerifyRaffleForm
              raffle={verifyingPurchase.raffle}
              initialDocumentId={verifyingPurchase.buyer.id}
              onClose={() => setVerifyingPurchase(null)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

