import Content from '@/components/Content/index';
import Meta from '@/components/Meta/index';
import Card from '@/components/Card/index';
import { AccountLayout } from '@/layouts/index';
import { useBranch } from '@/providers/branch';

const BranchDashboard = () => {
  const { branch } = useBranch();

  return (
    <AccountLayout>
      <Meta title={`Painel Swim - ${branch?.name || 'Academia'}`} />
      <Content.Title
        title={branch?.name || 'Academia'}
        subtitle="Painel de gerenciamento da academia"
      />
      <Content.Divider />
      <Content.Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Card>
            <Card.Body
              title="Alunos"
              subtitle="Gerencie os alunos matriculados"
            />
            <Card.Footer>
              <span className="text-gray-400">Em breve</span>
            </Card.Footer>
          </Card>
          <Card>
            <Card.Body
              title="Funcionários"
              subtitle="Gerencie sua equipe"
            />
            <Card.Footer>
              <span className="text-gray-400">Em breve</span>
            </Card.Footer>
          </Card>
          <Card>
            <Card.Body
              title="Turmas"
              subtitle="Gerencie as turmas e horários"
            />
            <Card.Footer>
              <span className="text-gray-400">Em breve</span>
            </Card.Footer>
          </Card>
        </div>
      </Content.Container>
    </AccountLayout>
  );
};

export default BranchDashboard;
