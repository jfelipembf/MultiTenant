import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import {
  CheckIcon,
  ChevronUpDownIcon,
  PlusIcon,
} from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

import Button from '@/components/Button/index';
import Modal from '@/components/Modal/index';
import { useBranches } from '@/hooks/data/index';
import api from '@/lib/common/api';
import { useBranch } from '@/providers/branch';

const Actions = () => {
  const { data, isLoading } = useBranches();
  const { branch, setBranch } = useBranch();
  const router = useRouter();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setModalState] = useState(false);
  const validName = name.length > 0 && name.length <= 50;

  const createBranch = (event) => {
    event.preventDefault();
    setSubmittingState(true);
    api('/api/branch', {
      body: { name },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleModal();
        setName('');
        toast.success('Academia criada com sucesso!');
        router.reload();
      }
    });
  };

  const handleNameChange = (event) => setName(event.target.value);

  const handleBranchChange = (branch) => {
    setBranch(branch);
    router.replace(`/account/${branch?.slug}`);
  };

  const toggleModal = () => setModalState(!showModal);

  return (
    <div className="flex flex-col items-stretch justify-center px-5 space-y-3">
      <Button
        className="text-white bg-blue-600 hover:bg-blue-500"
        onClick={toggleModal}
      >
        <PlusIcon className="w-5 h-5 text-white" aria-hidden="true" />
        <span>Nova Academia</span>
      </Button>
      <Modal show={showModal} title="Criar Academia" toggle={toggleModal}>
        <div className="space-y-0 text-sm text-gray-600">
          <p>Crie uma nova academia para gerenciar seus alunos e funcionários.</p>
          <p>Você poderá configurar os detalhes depois.</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">Nome da Academia</h3>
          <p className="text-sm text-gray-400">
            Use o nome oficial da academia
          </p>
          <input
            className="w-full px-3 py-2 border rounded"
            disabled={isSubmitting}
            onChange={handleNameChange}
            placeholder="Ex: Academia Aquática"
            type="text"
            value={name}
          />
        </div>
        <div className="flex flex-col items-stretch">
          <Button
            className="text-white bg-blue-600 hover:bg-blue-500"
            disabled={!validName || isSubmitting}
            onClick={createBranch}
          >
            <span>{isSubmitting ? 'Criando...' : 'Criar Academia'}</span>
          </Button>
        </div>
      </Modal>
      <Listbox value={branch} onChange={handleBranchChange}>
        <div className="relative">
          <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white rounded-lg shadow-md cursor-default">
            <span className="block text-gray-600 truncate">
              {isLoading
                ? 'Carregando academias...'
                : data?.branches?.length === 0
                  ? 'Nenhuma academia encontrada'
                  : branch === null
                    ? 'Selecione uma academia'
                    : branch.name}
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronUpDownIcon
                className="w-5 h-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          {data?.branches?.length > 0 && (
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 z-50">
                {data?.branches.map((branchItem, index) => (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      `${active ? 'text-blue-800 bg-blue-200' : 'text-gray-800'}
                          cursor-pointer select-none relative py-2 pl-10 pr-4`
                    }
                    value={branchItem}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`${selected ? 'font-bold' : 'font-normal'
                            } block truncate`}
                        >
                          {branchItem.name}
                        </span>
                        {selected ? (
                          <span
                            className={`${active ? 'text-blue-600' : 'text-blue-600'
                              }
                                absolute inset-y-0 left-0 flex items-center pl-3`}
                          >
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          )}
        </div>
      </Listbox>
    </div>
  );
};

export default Actions;
