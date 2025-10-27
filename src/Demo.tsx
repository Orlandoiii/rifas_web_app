import { useMemo, useState } from 'react'
import { Button } from './components/lib/components/button'
import { Input } from './components/lib/components/input'
import { MaskedInput } from './components/lib/components/input/mask'
import { Select, SelectSearch } from './components/lib/components/select'
import { DataGrid, type DataGridProps } from './components/lib/components/data_grid'
import Modal from './components/lib/components/modal/core/Modal'
import { useTheme } from './components/lib/components/theme'
import { useWithLoaderAsync } from './components/lib/components/modal/load_modal/loadModalStore'

type Person = { id: number; name: string; email: string; age: number }

function Demo() {
  const { theme, setTheme, selectedColor, setSelectedColor } = useTheme()
  const withLoaderAsync = useWithLoaderAsync()

  const [openModal, setOpenModal] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', date: '', amount: '' })
  const [colorValue, setColorValue] = useState('')
  const [searchValue, setSearchValue] = useState('')

  const options = useMemo(() => (
    [
      { value: 'coral', label: 'Coral' },
      { value: 'mint', label: 'Menta' },
      { value: 'electric', label: 'Eléctrico' },
    ]
  ), [])

  const people = useMemo<Person[]>(() => (
    [
      { id: 1, name: 'Ana Pérez', email: 'ana@example.com', age: 28 },
      { id: 2, name: 'Luis Gómez', email: 'luis@example.com', age: 35 },
      { id: 3, name: 'María López', email: 'maria@example.com', age: 23 },
      { id: 4, name: 'Carlos Ruiz', email: 'carlos@example.com', age: 41 },
      { id: 5, name: 'Sofía Díaz', email: 'sofia@example.com', age: 30 },
    ]
  ), [])

  const columns = useMemo<DataGridProps<Person, unknown>['columns']>(() => ([
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Correo' },
    { accessorKey: 'age', header: 'Edad' },
  ]), [])

  const validateRequired = (v: string) => v.trim().length > 0

  const handleSubmit = () => {
    setHasSubmitted(true)
    const valid = validateRequired(form.name) && validateRequired(form.phone)
    if (!valid) return
    setOpenModal(true)
  }

  const simulateAsync = async () => {
    await withLoaderAsync(async () => new Promise((r) => setTimeout(r, 1200)), 'Procesando...')
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-bg-secondary border border-border-light rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setTheme('light')}>Tema: Claro</Button>
          <Button variant="secondary" onClick={() => setTheme('dark')}>Tema: Oscuro</Button>
          <Button variant="secondary" onClick={() => setTheme('system')}>Tema: Sistema</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setSelectedColor('coral')}>Coral</Button>
          <Button variant="outline" onClick={() => setSelectedColor('mint')}>Menta</Button>
          <Button variant="outline" onClick={() => setSelectedColor('electric')}>Eléctrico</Button>
          <Button variant="outline" onClick={() => setSelectedColor('binance')}>Binance</Button>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-border-light rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Botones</h3>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Pequeño</Button>
            <Button size="lg">Grande</Button>
            <Button size="xl">XL</Button>
            <Button size="icon" aria-label="icono">★</Button>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-light rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Inputs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre"
              placeholder="Tu nombre"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              hasSubmitted={hasSubmitted}
              error={!validateRequired(form.name) && hasSubmitted ? 'Requerido' : undefined}
            />

            <Input
              label="Usuario"
              placeholder="@usuario"
              variant="floating"
            />

            <MaskedInput
              label="Teléfono"
              placeholder="0412-123-45-67"
              mask={{ type: 'phone' }}
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
              hasSubmitted={hasSubmitted}
              error={!validateRequired(form.phone) && hasSubmitted ? 'Requerido' : undefined}
            />

            <MaskedInput
              label="Fecha"
              placeholder="25/12/2025"
              mask={{ type: 'date' }}
              value={form.date}
              onChange={(v) => setForm((s) => ({ ...s, date: v }))}
            />

            <MaskedInput
              label="Monto"
              placeholder="0,00"
              mask={{ type: 'currency' }}
              value={form.amount}
              onChange={(v) => setForm((s) => ({ ...s, amount: v }))}
            />
          </div>
          <div className="pt-2">
            <Button onClick={handleSubmit}>Enviar</Button>
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-light rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Select y Select con Búsqueda</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Color"
              options={options}
              placeholder="Selecciona..."
              value={colorValue}
              onValueChange={setColorValue}
            />
            <SelectSearch
              label="Buscar color"
              options={options}
              placeholder="Escribe para buscar..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
          </div>
        </div>

        <div className="bg-bg-secondary border border-border-light rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold">Modal y Loader</h3>
          <div className="flex gap-2">
            <Button onClick={() => setOpenModal(true)}>Abrir Modal</Button>
            <Button variant="outline" onClick={simulateAsync}>Mostrar Loader</Button>
          </div>
          <Modal open={openModal} onClose={() => setOpenModal(false)} title="Ejemplo de Modal" size="md">
            <div className="space-y-3">
              <p className='text-text-primary'>Contenido del modal en tema "{theme}" y color "{selectedColor}".</p>
              <Button onClick={() => setOpenModal(false)}>Cerrar</Button>
            </div>
          </Modal>
        </div>

        <div className="bg-bg-secondary border border-border-light rounded-xl p-5 space-y-4 lg:col-span-2">
          <h3 className="text-lg font-semibold">DataGrid</h3>
          <DataGrid<Person, unknown>
            columns={columns}
            data={people}
            enableEdit
            enableView
            onView={(row) => console.log('view', row.original)}
            onEdit={(row) => console.log('edit', row.original)}
          />
        </div>
      </section>
    </div>
  )
}

export default Demo


