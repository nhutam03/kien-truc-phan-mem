import redis.clients.jedis.Jedis;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;

public class Worker {
    public static void main(String[] args) {
        String redisHost = System.getenv("REDIS_HOST") != null ? System.getenv("REDIS_HOST") : "redis";
        String dbHost = System.getenv("DB_HOST") != null ? System.getenv("DB_HOST") : "db";
        Jedis jedis = new Jedis(redisHost);

        try (Connection conn = DriverManager.getConnection(
                "jdbc:postgresql://" + dbHost + ":5432/votes", "postgres", "postgres")) {
            conn.createStatement()
                    .execute("CREATE TABLE IF NOT EXISTS votes (id SERIAL PRIMARY KEY, vote VARCHAR(50))");

            while (true) {
                String vote = jedis.rpop("votes");
                if (vote != null) {
                    PreparedStatement stmt = conn.prepareStatement("INSERT INTO votes (vote) VALUES (?)");
                    stmt.setString(1, vote);
                    stmt.executeUpdate();
                    System.out.println("Processed vote: " + vote);
                }
                Thread.sleep(1000);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}