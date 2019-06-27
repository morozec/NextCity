namespace DBRepository.Factories
{
    public interface IRepositoryContextFactory
    {
        RepositoryContext CreateDbContext(string connectionString);
    }
}